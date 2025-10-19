import { Router } from "express";
const router = Router();
import UserController from "../../controllers/user.controller.js";
import { authenticateToken } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/rbac.middleware.js";
import {
  canCreateUser,
  canDeleteUser,
  canUpdateUser,
  canViewUsers,
} from "../../middleware/abac/user.middleware.js";

// Middleware
router.use(authenticateToken);
router.use(authorizeRole("admin", "staff"));

// Routes
router.get("/", canViewUsers, UserController.list);
router.post("/", canCreateUser, UserController.create);
router.put("/:id", canUpdateUser, UserController.update);
router.delete("/:id", canDeleteUser, UserController.delete);

export default router;
