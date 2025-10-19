import express from "express";
import axios from "axios";
import {
  isAuthenticated,
  redirectIfAuthenticated,
} from "../../middleware/auth.middleware.js";
import DashboardController from "../../controllers/dashboard.controller.js";
import { ENV } from "../../config/env.js";
import passport from "passport";

const router = express.Router();

// Authentication routes
router.get("/register", (req, res) => {
  res.render("auth/register", { title: "Register" });
});

router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const response = await axios.post(`${ENV.HOST_URL}/api/auth/register`, {
      username,
      email,
      password,
      role,
    });

    res.redirect("/login");
  } catch (error) {
    res.render("auth/register", {
      title: "Register gagal",
      message: "Pendaftaran gagal. Silakan coba lagi.",
    });
  }
});

router.get("/login", redirectIfAuthenticated, (req, res) => {
  res.render("auth/login", { title: "Login" });
});

// login with google
router.get(
  "/login-with-google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      token: req.user.accessToken,
    };

    res.redirect("/dashboard");
  }
);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await axios.post("http://localhost:3000/api/auth/login", {
      username,
      password,
    });

    const token = response.data.accessToken;
    const id = response.data.user.id;
    const role = response.data.user.role;

    // save to cookie
    // res.cookie("token", token, { httpOnly: true });

    // save to session
    req.session.user = {
      id: id,
      username: username,
      role: role,
      token: token,
    };

    res.redirect("/dashboard");
  } catch (error) {
    res.render("auth/login", {
      title: "Login gagal",
      error: "Username atau password salah.",
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    // res.clearCookie("token");
    res.redirect("/login");
  });
});

router.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

router.get("/dashboard", isAuthenticated, DashboardController.index);

// User management routes
router.post("/users", isAuthenticated, DashboardController.createUser);
router.delete("/users/:id", isAuthenticated, DashboardController.deleteUser);
router.put("/users/:id", isAuthenticated, DashboardController.updateUser);

// Product management routes
router.post("/products", isAuthenticated, DashboardController.createProduct);
router.delete(
  "/products/:id",
  isAuthenticated,
  DashboardController.deleteProduct
);
router.put("/products/:id", isAuthenticated, DashboardController.updateProduct);

// // Order management routes
// router.delete("/orders/:id", isAuthenticated, DashboardController.deleteOrder);
// router.put("/orders/:id", isAuthenticated, DashboardController.updateOrder);
router.post("/orders", isAuthenticated, DashboardController.createOrder);

// Error handling
router.use((req, res) => {
  res.status(404).render("error/not-found", { title: "404 Not Found" });
});

export default router;
