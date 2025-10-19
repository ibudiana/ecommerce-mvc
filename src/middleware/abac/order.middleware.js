import { OrderModel } from "../../models/order.model.js";
import OrderPolicy from "../../policies/order.policy.js";

export function canViewOwnOrder(req, res, next) {
  // if id param is not present, skip this middleware
  if (!req.params.id) return next();

  // fetch the order
  const order = OrderModel.findById(parseInt(req.params.id));

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (OrderPolicy.view(req.user, order)) return next();

  return res.status(403).json({ error: "Forbidden to view order" });
}
