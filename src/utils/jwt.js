import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export function signAccess(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      attrs: user.attributes,
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.ACCESS_EXPIRES_IN }
  );
}

export function signRefresh(user) {
  return jwt.sign({ id: user.id, type: "refresh" }, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.REFRESH_EXPIRES_IN,
  });
}

export function verifyToken(token, isRefresh = false) {
  if (isRefresh) {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET);
  } else {
    return jwt.verify(token, ENV.JWT_SECRET);
  }
}
