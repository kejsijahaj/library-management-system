import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["pending", "ready", "fulfilled", "cancelled"],
      default: "pending"
    },
    readyAt: Date,
    fulfilledAt: Date,
    cancelledAt: Date
  },
  { timestamps: true }
);

reservationSchema.index({ book: 1, status: 1, createdAt: 1 });
reservationSchema.index({ member: 1, status: 1 });

const Reservation = mongoose.model("Reservation", reservationSchema);

export default Reservation;
