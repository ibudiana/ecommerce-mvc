// import UserModel from "../../models/user.model.js";
// const clearanceLevels = { low: 1, medium: 2, high: 3 };
// // const classificationLevels = { public: 1, vip: 2, restricted: 3 };

// // Middleware for User Management
// export function canViewUsers(req, res, next) {
//   const user = req.user;

//   //   Admin can view all users
//   if (user.role === "admin") return next();

//   // Check authorization
//   const attrs = user.attributes || {};
//   const userClear = clearanceLevels[attrs.clearance] || 1;

//   console.log("User clearance level:", userClear);
//   console.log(user.role);

//   if (user.role === "staff" && userClear >= 1) {
//     return next();
//   }

//   return res.status(403).json({ error: "Forbidden Access" });
// }

// export function canCreateUser(req, res, next) {
//   const user = req.user;

//   // Admin can create any user
//   if (user.role === "admin") return next();

//   // Staff with high clearance can create staff and customers
//   const attrs = user.attributes || {};
//   const userClear = clearanceLevels[attrs.clearance] || 1;
//   console.log("User clearance level:", userClear);
//   console.log(user.role);

//   if (user.role === "staff" && userClear >= 2) {
//     // allowed to create customers
//     const { role } = req.body;
//     if (role === "customer" || role === "seller") {
//       return next();
//     } else {
//       return res
//         .status(403)
//         .json({ error: "Forbidden: cannot create admin and staff users" });
//     }
//   }

//   return res.status(403).json({ error: "Forbidden Access" });
// }

// export function canUpdateUser(req, res, next) {
//   const user = req.user;

//   // Admin can update any user
//   if (user.role === "admin") return next();

//   // Staff with high clearance can update staff and customers
//   const attrs = user.attributes || {};
//   const userClear = clearanceLevels[attrs.clearance] || 1;

//   if (user.role === "staff" && userClear >= 2) {
//     const id = parseInt(req.params.id);
//     const targetUser = UserModel.findById(id);
//     // can only update customers and sellers
//     if (
//       targetUser &&
//       (targetUser.role === "customer" || targetUser.role === "seller")
//     ) {
//       return next();
//     }
//   }

//   return res.status(403).json({ error: "Forbidden Access" });
// }

// export function canDeleteUser(req, res, next) {
//   const user = req.user;

//   // Only Admin can delete users
//   if (user.role === "admin") return next();

//   //   Staff with high clearance can delete customers
//   const attrs = user.attributes || {};
//   const userClear = clearanceLevels[attrs.clearance] || 1;

//   if (user.role === "staff" && userClear === 3) {
//     const id = parseInt(req.params.id);
//     const targetUser = UserModel.findById(id);
//     // can only delete customers and sellers
//     if (
//       targetUser &&
//       (targetUser.role === "customer" || targetUser.role === "seller")
//     ) {
//       return next();
//     }
//   }

//   return res.status(403).json({ error: "Forbidden Access" });
// }

import UserModel from "../../models/user.model.js";
import UserPolicy from "../../policies/user.policy.js";

export function canViewUsers(req, res, next) {
  if (UserPolicy.view(req.user)) return next();

  return res.status(403).json({ error: "Forbidden Access" });
}

export function canCreateUser(req, res, next) {
  const roleToCreate = req.body.role;

  if (UserPolicy.create(req.user, roleToCreate)) return next();

  return res.status(403).json({ error: "Forbidden Access" });
}

export function canUpdateUser(req, res, next) {
  const targetUser = UserModel.findById(parseInt(req.params.id));

  if (!targetUser)
    return res.status(404).json({ error: "Target user not found" });

  const currentUser = req.user;
  const newRole = req.body.role;

  if (newRole === "admin" && currentUser.role !== "admin") {
    return res.status(403).json({ error: "Only admin can assign admin role" });
  }

  if (targetUser.role === "staff" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden Access" });
  }

  if (targetUser.role === "admin" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden Access" });
  }

  if (UserPolicy.update(req.user, targetUser)) return next();
  return res.status(403).json({ error: "Forbidden Access" });
}

export function canDeleteUser(req, res, next) {
  const targetUser = UserModel.findById(parseInt(req.params.id));

  if (!targetUser)
    return res.status(404).json({ error: "Target user not found" });

  if (UserPolicy.delete(req.user, targetUser)) return next();
  return res.status(403).json({ error: "Forbidden Access" });
}
