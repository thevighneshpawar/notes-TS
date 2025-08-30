import mongoose, { Document, Schema } from "mongoose";

// 1. Define TypeScript interface for User
export interface IUser extends Document {
  email: string;
  password?: string; // optional (Google login won’t need it)
  otp?: string; // temporary OTP storage
  otpExpiry?: Date; // when OTP expires
  name?: string; // for Google login
  googleId?: string; // for Google login
  createdAt: Date;
}

// 2. Create schema
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String }, // only if user registers with email/otp
    otp: { type: String },
    otpExpiry: { type: Date },
    name: { type: String },
    googleId: { type: String },
  },
  { timestamps: true }
);

// 3. Export model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
