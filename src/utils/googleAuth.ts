import jwt from "jsonwebtoken";

// Generate JWT tokens for Google users
export const generateGoogleTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign(
    { id: userId, email, authType: "google" },
    process.env.JWT_SECRET || "defaultsecret",
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId, email, authType: "google" },
    process.env.JWT_REFRESH_SECRET || "refreshsecret",
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// Set tokens as secure HTTP-only cookies
export const setGoogleTokensAsCookies = (
  res: any,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
