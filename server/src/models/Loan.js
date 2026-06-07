import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    borrowedAt: {
      type: Date,
      default: Date.now
    },
    dueAt: {
      type: Date,
      required: true
    },
    returnedAt: Date,
    returnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["active", "returned", "cancelled"],
      default: "active"
    },
    fineAtReturn: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { timestamps: true }
);

loanSchema.index({ member: 1, status: 1 });
loanSchema.index({ book: 1, status: 1 });
loanSchema.index({ dueAt: 1, status: 1 });

const Loan = mongoose.model("Loan", loanSchema);

export default Loan;
