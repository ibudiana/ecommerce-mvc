import { verifyToken } from "../utils/jwt.js";
import axios from "axios";
import { ENV } from "../config/env.js";
import db from "../config/db.js";

// Token authentication middleware
export function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Access token required" });
  const token = auth.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    // attach user payload
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      attributes: decoded.attrs || {},
    };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ error: "Token expired" });

    return res.status(403).json({ error: "Invalid token" });
  }
}

// Session authentication middleware

export async function isAuthenticated(req, res, next) {
  const user = req.session.user;

  if (!user || !user.token) {
    return res.redirect("/login");
  }

  try {
    // Verify token is still valid
    await axios.get(`${ENV.HOST_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    return next();
  } catch (err) {
    // If token expired, try to refresh
    if (err.response && err.response.status === 401) {
      try {
        // console.log("Attempting to find refresh token for user:", user.token);
        const refreshTokens = db.refreshTokens.filter(
          (t) => t.username === user.username
        );
        if (refreshTokens.length === 0) {
          return res.redirect("/login");
        }

        // Use refresh token to get new access token
        const newTokenResponse = await axios.post(
          `${ENV.HOST_URL}/api/auth/access`,
          {
            refreshToken: refreshTokens[0].token,
          }
        );

        const newAccessToken = newTokenResponse.data.accessToken;

        // Save new access token in session and cookie
        req.session.user.token = newAccessToken;
        // res.cookie("token", newAccessToken, { httpOnly: true });

        return next();
      } catch (refreshError) {
        // Hapus session dan cookie agar tidak looping
        req.session.user = null;
        // res.clearCookie("token");
        return res.redirect("/login");
      }
    }

    // If not expired error or refresh failed
    return res.redirect("/login");
  }
}

export function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return res.redirect("/dashboard");
  }
  next();
}

// export async function combinedAuth(req, res, next) {
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer ")
//   ) {
//     return authenticateToken(req, res, next);
//   }
//   if (req.session.user && req.session.user.token) {
//     return isAuthenticated(req, res, next);
//   }

//   return res.status(401).json({ error: "Access token required" });
// }
