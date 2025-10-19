import db from "../config/db.js";

const getClearance = (user) => {
  const attrs = user.attributes || {};
  return db.levels.find((level) => level.name === attrs.clearance)?.value || 1;
};

const ProductPolicy = {
  view() {
    return true;
  },

  create(user) {
    // admin dan seller bisa membuat produk
    if (user.role === db.roles[0].name) return true;
    if (user.role === db.roles[2].name) return true;
  },

  update(user, product) {
    // admin can update any product
    if (user.role === db.roles[0].name) return true;
    //   seller can update their own product
    if (user.role === db.roles[2].name) return product.userId === user.id;
  },

  delete(user, product) {
    // admin can delete any product
    if (user.role === db.roles[0].name) return true;
    //   seller can delete their own product
    if (user.role === db.roles[2].name) return product.userId === user.id;
  },
};

export default ProductPolicy;
