import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required.", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is missing on the server.", 500);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.status !== "active") {
    throw new AppError("User no longer has access.", 401);
  }

  req.user = user;
  next();
});

export const allowRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication is required.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission for this action.", 403));
    }

    return next();
  };
