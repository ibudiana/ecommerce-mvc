import db from "../config/db.js";

const getClearance = (user) => {
  const attrs = user.attributes || {};
  return db.levels.find((level) => level.name === attrs.clearance)?.value || 1;
};

const OrderPolicy = {
  view(user, order) {
    // admin can view any order
    if (user.role === db.roles[0].name) return true;
    //   customer can view their own order
    if (user.role === db.roles[3].name) return order.userId === user.id;
  },

  create(user) {
    // admin dan customer bisa membuat order
    if (user.role === db.roles[0].name) return true;
    if (user.role === db.roles[3].name) return true;
  },
};

export default OrderPolicy;
