import mongoose from "mongoose";
import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addLoanDays, calculateFine } from "../utils/fineUtils.js";

const populateLoan = (query) =>
  query.populate("book", "title author isbn").populate("member", "name email membershipCode").populate("issuedBy", "name email role").populate("returnedBy", "name email role");

const assertLoanAccess = (req, loan) => {
  if (req.user.role === "member" && String(loan.member._id || loan.member) !== String(req.user._id)) {
    throw new AppError("You can only access your own loans.", 403);
  }
};

const shapeLoan = (loan) => {
  const json = loan.toJSON();
  const isOverdue = json.status === "active" && new Date(json.dueAt) < new Date();

  return {
    ...json,
    computedFine: json.status === "returned" ? json.fineAtReturn : calculateFine(json.dueAt),
    isOverdue
  };
};

export const listLoans = asyncHandler(async (req, res) => {
  const { book, member, status } = req.query;
  const filter = {};

  if (req.user.role === "member") {
    filter.member = req.user._id;
  } else if (member) {
    filter.member = member;
  }

  if (book) filter.book = book;
  if (status === "overdue") {
    filter.status = "active";
    filter.dueAt = { $lt: new Date() };
  } else if (status) {
    filter.status = status;
  }

  const loans = await populateLoan(Loan.find(filter).sort({ updatedAt: -1 }));

  res.json({ loans: loans.map(shapeLoan) });
});

export const getLoan = asyncHandler(async (req, res) => {
  const loan = await populateLoan(Loan.findById(req.params.id));

  if (!loan) {
    throw new AppError("Loan not found.", 404);
  }

  assertLoanAccess(req, loan);
  res.json({ loan: shapeLoan(loan) });
});

export const createLoan = asyncHandler(async (req, res) => {
  const { book: bookId, member: memberId } = req.body;

  if (!bookId || !memberId) {
    throw new AppError("Book and member are required.", 400);
  }

  const session = await mongoose.startSession();
  let createdLoan;

  try {
    await session.withTransaction(async () => {
      const member = await User.findOne({ _id: memberId, role: "member", status: "active" }).session(session);

      if (!member) {
        throw new AppError("Active member not found.", 404);
      }

      const book = await Book.findOneAndUpdate(
        { _id: bookId, availableCopies: { $gt: 0 }, status: "active" },
        { $inc: { availableCopies: -1 } },
        { new: true, session }
      );

      if (!book) {
        throw new AppError("No available copies for this book.", 409);
      }

      const [loan] = await Loan.create(
        [
          {
            book: book._id,
            dueAt: addLoanDays(),
            issuedBy: req.user._id,
            member: member._id
          }
        ],
        { session }
      );

      createdLoan = loan;
    });
  } finally {
    await session.endSession();
  }

  const loan = await populateLoan(Loan.findById(createdLoan._id));
  res.status(201).json({ loan: shapeLoan(loan) });
});

export const updateLoan = asyncHandler(async (req, res) => {
  const updates = {};
  const allowedFields = ["dueAt", "fineAtReturn", "status"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const loan = await populateLoan(
    Loan.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
  );

  if (!loan) {
    throw new AppError("Loan not found.", 404);
  }

  res.json({ loan: shapeLoan(loan) });
});

export const returnLoan = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let returnedLoan;

  try {
    await session.withTransaction(async () => {
      const loan = await Loan.findOne({ _id: req.params.id, status: "active" }).session(session);

      if (!loan) {
        throw new AppError("Active loan not found.", 404);
      }

      const returnedAt = new Date();
      const nextReservation = await Reservation.findOne({ book: loan.book, status: "pending" }).sort({ createdAt: 1 }).session(session);

      if (nextReservation) {
        nextReservation.status = "ready";
        nextReservation.readyAt = returnedAt;
        await nextReservation.save({ session });
      } else {
        await Book.findByIdAndUpdate(loan.book, { $inc: { availableCopies: 1 } }, { session });
      }

      loan.fineAtReturn = calculateFine(loan.dueAt, returnedAt);
      loan.returnedAt = returnedAt;
      loan.returnedBy = req.user._id;
      loan.status = "returned";
      await loan.save({ session });

      returnedLoan = loan;
    });
  } finally {
    await session.endSession();
  }

  const loan = await populateLoan(Loan.findById(returnedLoan._id));
  res.json({ loan: shapeLoan(loan) });
});

export const deleteLoan = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    throw new AppError("Loan not found.", 404);
  }

  if (loan.status === "active") {
    throw new AppError("Return or cancel an active loan before deleting it.", 409);
  }

  await loan.deleteOne();
  res.json({ message: "Loan deleted." });
});
