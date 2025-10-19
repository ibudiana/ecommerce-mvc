import AuthController from "../../controllers/auth.controller.js";
import { authenticateToken } from "../../middleware/auth.middleware.js";
import { Router } from "express";
const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.get("/verify", authenticateToken, AuthController.verify);
// router.get("/refresh", authenticateToken, AuthController.refresh);

router.post("/access", AuthController.access);
router.post("/logout", AuthController.logout);

export default router;
