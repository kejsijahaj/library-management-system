import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      lowercase: true,
      trim: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["admin", "librarian", "member"],
      default: "member"
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    membershipCode: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.index({ role: 1, status: 1 });

const User = mongoose.model("User", userSchema);

export default User;
