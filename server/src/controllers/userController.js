import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createMembershipCode } from "../utils/membershipUtils.js";

const allowedRoles = ["admin", "librarian", "member"];

const normalizeEmail = (email) => email?.trim().toLowerCase();

const buildPasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const listUsers = asyncHandler(async (req, res) => {
  const { query, role, status } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (query) {
    const expression = new RegExp(query, "i");
    filter.$or = [{ name: expression }, { email: expression }, { membershipCode: expression }];
  }

  const users = await User.find(filter).sort({ updatedAt: -1 });

  res.json({ users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.json({ user });
});

export const createUser = asyncHandler(async (req, res) => {
  const { email, name, password, phone, role = "member" } = req.body;

  if (!allowedRoles.includes(role)) {
    throw new AppError("Invalid user role.", 400);
  }

  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required.", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await User.create({
    email: normalizedEmail,
    membershipCode: role === "member" ? createMembershipCode() : undefined,
    name,
    passwordHash: await buildPasswordHash(password),
    phone,
    role
  });

  res.status(201).json({ user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const updates = {};
  const allowedFields = ["email", "name", "phone", "role", "status"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = field === "email" ? normalizeEmail(req.body[field]) : req.body[field];
    }
  });

  if (updates.role && !allowedRoles.includes(updates.role)) {
    throw new AppError("Invalid user role.", 400);
  }

  if (updates.role === "member" && !req.body.membershipCode) {
    updates.membershipCode = createMembershipCode();
  }

  if (req.body.password) {
    updates.passwordHash = await buildPasswordHash(req.body.password);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    throw new AppError("You cannot deactivate your own account.", 409);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: "inactive" },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  res.json({ message: "User deactivated.", user });
});
