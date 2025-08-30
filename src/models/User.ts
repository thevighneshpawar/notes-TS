import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  dob: Date;
  email: string;
  otp?: string | undefined;
  otpExpiry?: Date | undefined;
  refreshToken?: string | undefined;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    otp: { type: String },
    otpExpiry: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
