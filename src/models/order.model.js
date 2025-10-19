import db from "../config/db.js";

export const OrderModel = {
  create(order) {
    db.orders.push(order);
    return order;
  },

  findById(id) {
    // find order by id and include its items
    const order = db.orders.find((o) => o.id === id);
    if (!order) return null;

    const items = db.orderItems.filter((item) => item.orderId === order.id);

    // calculate total price each item
    items.forEach((item) => {
      const product = db.products.find((p) => p.id === item.productId);
      item.unitPrice = product ? product.price : 0;
      item.totalPrice = item.unitPrice * item.quantity;
    });
    return { ...order, items };
  },

  all(currentUser) {
    return db.orders
      .filter((order) => {
        // Admin bisa lihat semua, customer hanya lihat order mereka
        return currentUser.role === "admin" || order.userId === currentUser.id;
      })
      .map((order) => ({
        ...order,
        items: db.orderItems.filter((item) => item.orderId === order.id),
        user: db.users.find((user) => user.id === order.userId),
        products: db.orderItems
          .filter((item) => item.orderId === order.id)
          .map((item) => db.products.find((p) => p.id === item.productId)),
      }));
  },

  delete(orderId) {
    const index = db.orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      db.orders.splice(index, 1);
    }
  },

  deleteByUserId(userId) {
    const ordersToDelete = db.orders.filter((o) => o.userId === userId);
    ordersToDelete.forEach((order) => {
      this.delete(order.id);
    });
  },

  //   all() {
  //     // return all orders with items with user and with product details
  //     return db.orders.map((order) => ({
  //       ...order,
  //       items: db.orderItems.filter((item) => item.orderId === order.id),
  //       user: db.users.find((user) => user.id === order.userId),
  //       products: db.orderItems
  //         .filter((item) => item.orderId === order.id)
  //         .map((item) => db.products.find((p) => p.id === item.productId)),
  //     }));
  //   },

  generateNextId() {
    const orders = db.orders;
    return orders.length ? orders[orders.length - 1].id + 1 : 1;
  },
};

export const OrderModelItem = {
  create(orderItem) {
    db.orderItems.push(orderItem);
    return orderItem;
  },

  findById(id) {
    return db.orderItems.find((o) => o.id === id);
  },

  all() {
    return db.orderItems;
  },

  delete(itemId) {
    const index = db.orderItems.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      db.orderItems.splice(index, 1);
    }
  },

  generateNextId() {
    const orderItems = db.orderItems;
    return orderItems.length ? orderItems[orderItems.length - 1].id + 1 : 1;
  },
};
