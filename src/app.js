import express from "express";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import passport from "./config/googleOAuth.js";
import { ENV } from "./config/env.js";
import seed from "./utils/seed.js";
import methodOverride from "method-override";

// --- Routes  ---
import apiRoutes from "./routes/api/index.routes.js";
import webRoutes from "./routes/web/index.routes.js";

const app = express();

// --- Konfigurasi path untuk EJS dan public folder ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main"); // default layout

// --- Static files ---
app.use(express.static(path.join(__dirname, "..", "public")));

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// --- Session & Passport ---
app.use(
  session({
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Seed data
seed();

// --- Routes utama ---
// api routes
app.use("/api", apiRoutes);

// web routes
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use("/", webRoutes);

export default app;
