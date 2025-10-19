import db from "../config/db.js";

const ProductModel = {
  create(product) {
    db.products.push(product);
    return product;
  },

  findById(id) {
    return db.products.find((p) => p.id === id);
  },

  findByName(name) {
    return db.products.find((p) => p.name === name);
  },

  deleteById(id) {
    const index = db.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      return db.products.splice(index, 1)[0];
    }
    return null;
  },

  all(currentUser) {
    return db.products
      .filter((product) => {
        return (
          currentUser.role === "admin" || product.userId === currentUser.id
        );
      })
      .map((product) => ({
        ...product,
        items: db.orderItems.filter((item) => item.orderId === product.id),
        user: db.users.find((user) => user.id === product.userId),
        products: db.orderItems
          .filter((item) => item.orderId === product.id)
          .map((item) => db.products.find((p) => p.id === item.productId)),
      }));
  },

  onlyApproved() {
    return db.products.filter((p) => p.approved);
  },

  isProductExists(name) {
    return !!this.findByName(name);
  },

  generateNextId() {
    const products = db.products;
    return products.length ? products[products.length - 1].id + 1 : 1;
  },

  update(id, updates) {
    const product = this.findById(id);
    if (!product) return null;

    Object.assign(product, updates);
    return product;
  },

  //   delete product by user id
  deleteByUserId(userId) {
    const productsToDelete = db.products.filter((p) => p.userId === userId);
    productsToDelete.forEach((product) => {
      this.deleteById(product.id);
    });
  },
};

export default ProductModel;
