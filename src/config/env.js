import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || "localhost",
  HOST_URL:
    process.env.HOST_URL || `http://localhost:${process.env.PORT || 3000}`,

  JWT_SECRET: process.env.JWT_SECRET || "supersecret_jwt",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "supersecret_refresh",
  ACCESS_EXPIRES_IN: process.env.ACCESS_EXPIRES_IN || "1h",
  REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || "7d",

  SESSION_SECRET: process.env.SESSION_SECRET || "session_secret_key",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL:
    process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:3000/auth/google/callback",
};
