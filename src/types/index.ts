export interface Usert {
  _id: string;
  name: string;
  dob: Date;
  email: string;
  otp?: string | undefined;
  otpExpiry?: Date | undefined;
  refreshToken?: string;
}
