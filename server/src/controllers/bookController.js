import Book from "../models/Book.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const normalizeCategories = (categories) => {
  if (!categories) return undefined;
  const raw = Array.isArray(categories) ? categories : String(categories).split(",");
  return raw.map((category) => category.trim()).filter(Boolean);
};

export const listBooks = asyncHandler(async (req, res) => {
  const { availability, category, query, status } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (category) filter.categories = category;
  if (availability === "available") filter.availableCopies = { $gt: 0 };
  if (availability === "unavailable") filter.availableCopies = 0;

  if (query) {
    const expression = new RegExp(query, "i");
    filter.$or = [{ title: expression }, { author: expression }, { isbn: expression }, { categories: expression }];
  }

  const books = await Book.find(filter).sort({ updatedAt: -1 });

  res.json({ books });
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new AppError("Book not found.", 404);
  }

  res.json({ book });
});

export const createBook = asyncHandler(async (req, res) => {
  const categories = normalizeCategories(req.body.categories);
  const totalCopies = Number(req.body.totalCopies ?? 1);
  const availableCopies = Number(req.body.availableCopies ?? totalCopies);

  if (availableCopies > totalCopies) {
    throw new AppError("Available copies cannot exceed total copies.", 400);
  }

  const book = await Book.create({
    ...req.body,
    availableCopies,
    categories,
    totalCopies
  });

  res.status(201).json({ book });
});

export const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    throw new AppError("Book not found.", 404);
  }

  const borrowedCopies = book.totalCopies - book.availableCopies;
  const nextTotalCopies = Number(req.body.totalCopies ?? book.totalCopies);

  if (nextTotalCopies < borrowedCopies) {
    throw new AppError("Total copies cannot be lower than the number currently borrowed.", 400);
  }

  const updates = { ...req.body };
  const categories = normalizeCategories(req.body.categories);

  if (categories) updates.categories = categories;
  if (req.body.totalCopies !== undefined) updates.totalCopies = nextTotalCopies;
  if (req.body.availableCopies !== undefined) {
    const nextAvailableCopies = Number(req.body.availableCopies);

    if (nextAvailableCopies > nextTotalCopies) {
      throw new AppError("Available copies cannot exceed total copies.", 400);
    }

    updates.availableCopies = nextAvailableCopies;
  } else if (req.body.totalCopies !== undefined) {
    updates.availableCopies = nextTotalCopies - borrowedCopies;
  }

  const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  res.json({ book: updatedBook });
});

export const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { status: "archived" },
    {
      new: true,
      runValidators: true
    }
  );

  if (!book) {
    throw new AppError("Book not found.", 404);
  }

  res.json({ book, message: "Book archived." });
});
