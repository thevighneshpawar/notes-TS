import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for Google OAuth endpoints
export const googleAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many Google authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
export const validateGoogleToken = (req: Request, res: Response, next: NextFunction) => {
  const { idToken } = req.body;
  
  if (!idToken || typeof idToken !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid Google ID token is required",
    });
  }

  // Basic token format validation (JWT format)
  if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(idToken)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Google token format",
    });
  }

  next();
};

// Validate date of birth
export const validateDOB = (req: Request, res: Response, next: NextFunction) => {
  const { dob } = req.body;
  
  if (!dob) {
    return res.status(400).json({
      success: false,
      message: "Date of birth is required",
    });
  }

  const dobDate = new Date(dob);
  const now = new Date();
  const minAge = 13; // Minimum age requirement
  const maxAge = 120; // Maximum age limit

  if (isNaN(dobDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format",
    });
  }

  const age = now.getFullYear() - dobDate.getFullYear();
  const monthDiff = now.getMonth() - dobDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dobDate.getDate())) {
    age--;
  }

  if (age < minAge) {
    return res.status(400).json({
      success: false,
      message: `You must be at least ${minAge} years old to register`,
    });
  }

  if (age > maxAge) {
    return res.status(400).json({
      success: false,
      message: "Invalid date of birth",
    });
  }

  next();
};

// Sanitize user input
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string inputs
  if (req.body.name) {
    req.body.name = req.body.name.trim().replace(/[<>]/g, "");
  }
  
  if (req.body.email) {
    req.body.email = req.body.email.trim().toLowerCase();
  }

  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://accounts.google.com;"
  );

  next();
}; 