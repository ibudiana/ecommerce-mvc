import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ENV } from "./env.js";
import usersModel from "../models/user.model.js";
import { signAccess, signRefresh } from "../utils/jwt.js";
import db from "./db.js";

// --- Google OAuth Configuration ---
passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
      passReqToCallback: true, // <<< penting!
    },
    (req, googleAccessToken, googleRefreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const username = email.split("@")[0];

      // Ambil role dari session
      const selectedRole = req.session.selectedRole || "customer";

      let user = usersModel.findByEmail(email);

      if (!user) {
        user = usersModel.create({
          id: usersModel.generateNextId(),
          username,
          email,
          role: selectedRole,
          verified_seller: false,
        });
      }

      // generate JWT token
      const jwtAccessToken = signAccess(user);
      const jwtRefreshToken = signRefresh(user);

      db.refreshTokens = db.refreshTokens.filter((rt) => rt.userId !== user.id);
      db.refreshTokens.push({
        token: jwtRefreshToken,
        userId: user.id,
        username: user.username,
        createdAt: Date.now(),
      });

      user.accessToken = jwtAccessToken;
      user.refreshToken = jwtRefreshToken;

      return done(null, user);
    }
  )
);

// Serialize & deserialize session user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = usersModel.findById(id);
  done(null, user);
});

export default passport;
