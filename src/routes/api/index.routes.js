// src/routes/index.js
import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import productRoutes from "./product.routes.js";
import orderRoutes from "./order.routes.js";

const router = express.Router();

// router.get("/", (req, res) => {
//   res.render("index", { title: "Home" });
// });

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

// routes with session
// router.get("/dashboard", (req, res) => {
//   if (!req.session.user) {
//     return res.redirect("/auth/login");
//   }
//   res.render("admin/dashboard", { title: "Dashboard", user: req.session.user });
// });
// router.get("/dashboard", isAuthenticated, (req, res) => {
//   res.render("admin/dashboard", { title: "Dashboard" });
// });

export default router;
