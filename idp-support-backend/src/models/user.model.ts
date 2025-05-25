import mongoose, { Schema } from "mongoose";
import { UserStatus } from "../enums/UserStatus.js";
import { UserRole } from "../enums/UserRole.js";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  status: UserStatus;
  avatar?: string;
  role: UserRole;
  isDocumentsVerified?: boolean;
  documents: string[];
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  status: { type: String, enum: Object.values(UserStatus), required: true },
  avatar: { type: String },
  role: { type: String, enum: Object.values(UserRole), required: true },
  isDocumentsVerified: { type: Boolean, default: false },
  documents: [String],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;