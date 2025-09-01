import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  dob: Date;
  email: string;
  googleId?: string;
  authType: "email" | "google";
  otp?: string | undefined;
  otpExpiry?: Date | undefined;
  refreshToken?: string | undefined;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    dob: {
      type: Date,
      required: function () {
        return this.authType === "email";
      },
    },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, sparse: true, unique: true },
    authType: { type: String, enum: ["email", "google"], default: "email" },
    otp: { type: String },
    otpExpiry: { type: Date },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

// Compound index to ensure email + authType combination is unique
userSchema.index({ email: 1, authType: 1 }, { unique: true });

const User = mongoose.model<IUser>("User", userSchema);
export default User;
