import ProductModel from "../../models/product.model.js";
import ProductPolicy from "../../policies/product.policy.js";

export function canUpdateOwnProduct(req, res, next) {
  const product = ProductModel.findById(parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (ProductPolicy.update(req.user, product)) return next();

  return res.status(403).json({ error: "Forbidden to update product" });
}

export function canDeleteOwnProduct(req, res, next) {
  const product = ProductModel.findById(parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (ProductPolicy.delete(req.user, product)) return next();

  return res.status(403).json({ error: "Forbidden to delete product" });
}
