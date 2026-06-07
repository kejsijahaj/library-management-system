import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required."],
      trim: true
    },
    author: {
      type: String,
      required: [true, "Book author is required."],
      trim: true
    },
    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    categories: [
      {
        type: String,
        trim: true
      }
    ],
    shelfLocation: {
      type: String,
      trim: true,
      default: "Unassigned"
    },
    publishedYear: {
      type: Number,
      min: 0
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    totalCopies: {
      type: Number,
      min: 0,
      default: 1
    },
    availableCopies: {
      type: Number,
      min: 0,
      default: 1
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    }
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text", isbn: "text", categories: "text" });

const Book = mongoose.model("Book", bookSchema);

export default Book;
