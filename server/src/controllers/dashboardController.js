import Book from "../models/Book.js";
import Loan from "../models/Loan.js";
import Reservation from "../models/Reservation.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { calculateFine } from "../utils/fineUtils.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();

  if (req.user.role === "member") {
    const [activeLoans, overdueLoans, reservations, returnedLoans] = await Promise.all([
      Loan.countDocuments({ member: req.user._id, status: "active" }),
      Loan.find({ dueAt: { $lt: now }, member: req.user._id, status: "active" }).select("dueAt"),
      Reservation.countDocuments({ member: req.user._id, status: { $in: ["pending", "ready"] } }),
      Loan.find({ member: req.user._id, status: "returned" }).select("fineAtReturn")
    ]);

    const fineTotal =
      overdueLoans.reduce((total, loan) => total + calculateFine(loan.dueAt, now), 0) +
      returnedLoans.reduce((total, loan) => total + loan.fineAtReturn, 0);

    return res.json({
      scope: "member",
      metrics: {
        activeLoans,
        fineTotal: Number(fineTotal.toFixed(2)),
        overdueLoans: overdueLoans.length,
        reservations
      }
    });
  }

  const [
    totalBooks,
    activeBooks,
    totalUsers,
    activeLoans,
    overdueLoanDocs,
    pendingReservations,
    readyReservations,
    returnedFineTotals,
    mostBorrowedBooks
  ] = await Promise.all([
    Book.countDocuments(),
    Book.countDocuments({ status: "active" }),
    User.countDocuments({ status: "active" }),
    Loan.countDocuments({ status: "active" }),
    Loan.find({ dueAt: { $lt: now }, status: "active" }).select("dueAt"),
    Reservation.countDocuments({ status: "pending" }),
    Reservation.countDocuments({ status: "ready" }),
    Loan.aggregate([{ $match: { status: "returned" } }, { $group: { _id: null, total: { $sum: "$fineAtReturn" } } }]),
    Loan.aggregate([
      { $group: { _id: "$book", loans: { $sum: 1 } } },
      { $sort: { loans: -1 } },
      { $limit: 5 },
      { $lookup: { as: "book", foreignField: "_id", from: "books", localField: "_id" } },
      { $unwind: "$book" },
      { $project: { _id: 0, author: "$book.author", bookId: "$book._id", loans: 1, title: "$book.title" } }
    ])
  ]);

  const activeFineTotal = overdueLoanDocs.reduce((total, loan) => total + calculateFine(loan.dueAt, now), 0);
  const returnedFineTotal = returnedFineTotals[0]?.total || 0;

  res.json({
    scope: "staff",
    metrics: {
      activeBooks,
      activeLoans,
      fineTotal: Number((activeFineTotal + returnedFineTotal).toFixed(2)),
      overdueLoans: overdueLoanDocs.length,
      pendingReservations,
      readyReservations,
      totalBooks,
      totalUsers
    },
    mostBorrowedBooks
  });
});
