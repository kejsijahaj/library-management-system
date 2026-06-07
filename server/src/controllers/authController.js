import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createMembershipCode } from "../utils/membershipUtils.js";
import { createToken } from "../utils/tokenUtils.js";

const normalizeEmail = (email) => email?.trim().toLowerCase();

const sendAuthResponse = (res, statusCode, user) => {
  res.status(statusCode).json({
    token: createToken(user),
    user
  });
};

export const register = asyncHandler(async (req, res) => {
  const { email, name, password, phone } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required.", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    email: normalizedEmail,
    membershipCode: createMembershipCode(),
    name,
    passwordHash,
    phone,
    role: "member"
  });

  sendAuthResponse(res, 201, user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.status !== "active") {
    throw new AppError("This account is inactive.", 403);
  }

  sendAuthResponse(res, 200, user);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
