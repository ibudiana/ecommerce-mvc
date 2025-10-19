import { Router } from "express";
const router = Router();

import OrderController from "../../controllers/order.controller.js";
import { authenticateToken } from "../../middleware/auth.middleware.js";
import { authorizeRole } from "../../middleware/rbac.middleware.js";
import { canViewOwnOrder } from "../../middleware/abac/order.middleware.js";

// Middleware (required for protected routes)
router.use(authenticateToken);

// Routes
router.get(
  "/",
  authorizeRole("admin", "customer"),
  canViewOwnOrder,
  OrderController.list
);

router.get(
  "/:id",
  authorizeRole("admin", "customer"),
  canViewOwnOrder,
  OrderController.listById
);

router.post("/", authorizeRole("admin", "customer"), OrderController.create);

export default router;
