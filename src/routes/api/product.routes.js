import { Router } from "express";
const router = Router();
import ProductController from "../../controllers/product.controller.js";
import { authenticateToken } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/rbac.middleware.js";
import {
  canDeleteOwnProduct,
  canUpdateOwnProduct,
} from "../../middleware/abac/product.middleware.js";

// public routes

// Middleware
router.use(authenticateToken);
router.use(authorizeRole("admin", "seller"));

// Routes
router.get("/", ProductController.list);
router.get("/:id", ProductController.listById);
router.post("/", ProductController.create);
router.put("/:id", canUpdateOwnProduct, ProductController.update);
router.delete("/:id", canDeleteOwnProduct, ProductController.delete);

export default router;
