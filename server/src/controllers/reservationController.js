import mongoose from "mongoose";
import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addLoanDays } from "../utils/fineUtils.js";

const populateReservation = (query) => query.populate("book", "title author isbn").populate("member", "name email membershipCode");

const assertReservationAccess = (req, reservation) => {
  if (req.user.role === "member" && String(reservation.member._id || reservation.member) !== String(req.user._id)) {
    throw new AppError("You can only access your own reservations.", 403);
  }
};

const releaseHeldCopy = async (bookId, session) => {
  const nextReservation = await Reservation.findOne({ book: bookId, status: "pending" }).sort({ createdAt: 1 }).session(session);

  if (nextReservation) {
    nextReservation.status = "ready";
    nextReservation.readyAt = new Date();
    await nextReservation.save({ session });
    return nextReservation;
  }

  await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } }, { session });
  return null;
};

export const listReservations = asyncHandler(async (req, res) => {
  const { book, member, status } = req.query;
  const filter = {};

  if (req.user.role === "member") {
    filter.member = req.user._id;
  } else if (member) {
    filter.member = member;
  }

  if (book) filter.book = book;
  if (status) filter.status = status;

  const reservations = await populateReservation(Reservation.find(filter).sort({ updatedAt: -1 }));

  res.json({ reservations });
});

export const getReservation = asyncHandler(async (req, res) => {
  const reservation = await populateReservation(Reservation.findById(req.params.id));

  if (!reservation) {
    throw new AppError("Reservation not found.", 404);
  }

  assertReservationAccess(req, reservation);
  res.json({ reservation });
});

export const createReservation = asyncHandler(async (req, res) => {
  const bookId = req.body.book;
  const memberId = req.user.role === "member" ? req.user._id : req.body.member;

  if (!bookId || !memberId) {
    throw new AppError("Book and member are required.", 400);
  }

  const [book, member, existingReservation] = await Promise.all([
    Book.findById(bookId),
    User.findOne({ _id: memberId, role: "member", status: "active" }),
    Reservation.findOne({ book: bookId, member: memberId, status: { $in: ["pending", "ready"] } })
  ]);

  if (!book || book.status !== "active") {
    throw new AppError("Active book not found.", 404);
  }

  if (!member) {
    throw new AppError("Active member not found.", 404);
  }

  if (book.availableCopies > 0) {
    throw new AppError("Reservations are only allowed when no copies are available.", 409);
  }

  if (existingReservation) {
    throw new AppError("This member already has an active reservation for this book.", 409);
  }

  const reservation = await Reservation.create({
    book: book._id,
    member: member._id
  });

  const populatedReservation = await populateReservation(Reservation.findById(reservation._id));
  res.status(201).json({ reservation: populatedReservation });
});

export const updateReservation = asyncHandler(async (req, res) => {
  const updates = {};
  const allowedFields = ["cancelledAt", "fulfilledAt", "readyAt", "status"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const reservation = await populateReservation(
    Reservation.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
  );

  if (!reservation) {
    throw new AppError("Reservation not found.", 404);
  }

  res.json({ reservation });
});

export const cancelReservation = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let cancelledReservation;

  try {
    await session.withTransaction(async () => {
      const reservation = await Reservation.findById(req.params.id).session(session);

      if (!reservation) {
        throw new AppError("Reservation not found.", 404);
      }

      if (req.user.role === "member" && String(reservation.member) !== String(req.user._id)) {
        throw new AppError("You can only cancel your own reservations.", 403);
      }

      if (!["pending", "ready"].includes(reservation.status)) {
        throw new AppError("Only pending or ready reservations can be cancelled.", 409);
      }

      const wasReady = reservation.status === "ready";
      reservation.status = "cancelled";
      reservation.cancelledAt = new Date();
      await reservation.save({ session });

      if (wasReady) {
        await releaseHeldCopy(reservation.book, session);
      }

      cancelledReservation = reservation;
    });
  } finally {
    await session.endSession();
  }

  const reservation = await populateReservation(Reservation.findById(cancelledReservation._id));
  res.json({ reservation });
});

export const fulfillReservation = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  let fulfilledReservation;
  let createdLoan;

  try {
    await session.withTransaction(async () => {
      const reservation = await Reservation.findOne({ _id: req.params.id, status: "ready" }).session(session);

      if (!reservation) {
        throw new AppError("Ready reservation not found.", 404);
      }

      const [loan] = await Loan.create(
        [
          {
            book: reservation.book,
            dueAt: addLoanDays(),
            issuedBy: req.user._id,
            member: reservation.member
          }
        ],
        { session }
      );

      reservation.status = "fulfilled";
      reservation.fulfilledAt = new Date();
      await reservation.save({ session });

      createdLoan = loan;
      fulfilledReservation = reservation;
    });
  } finally {
    await session.endSession();
  }

  const reservation = await populateReservation(Reservation.findById(fulfilledReservation._id));
  const loan = await Loan.findById(createdLoan._id).populate("book", "title author isbn").populate("member", "name email membershipCode");

  res.json({ loan, reservation });
});

export const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new AppError("Reservation not found.", 404);
  }

  if (["pending", "ready"].includes(reservation.status)) {
    throw new AppError("Cancel an active reservation before deleting it.", 409);
  }

  await reservation.deleteOne();
  res.json({ message: "Reservation deleted." });
});
