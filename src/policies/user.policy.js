import db from "../config/db.js";

const getClearance = (user) => {
  const attrs = user.attributes || {};
  return db.levels.find((level) => level.name === attrs.clearance)?.value || 1;
};

const UserPolicy = {
  view(user) {
    if (user.role === db.roles[0].name) return true;
    return user.role === db.roles[1].name && getClearance(user) >= 1;
  },

  create(user, roleToCreate) {
    if (user.role === db.roles[0].name) return true;
    if (user.role === db.roles[1].name && getClearance(user) >= 2) {
      return (
        roleToCreate === db.roles[3].name || roleToCreate === db.roles[2].name
      );
    }
    return false;
  },

  update(user, targetUser) {
    if (user.role === db.roles[0].name) return true;
    if (user.role === db.roles[1].name && getClearance(user) >= 2) {
      return (
        targetUser &&
        (targetUser.role === db.roles[3].name ||
          targetUser.role === db.roles[2].name)
      );
    }
    return false;
  },

  delete(user, targetUser) {
    if (user.role === db.roles[0].name) return true;
    if (user.role === db.roles[1].name && getClearance(user) === 3) {
      return (
        targetUser &&
        (targetUser.role === db.roles[3].name ||
          targetUser.role === db.roles[2].name)
      );
    }
    return false;
  },
};

export default UserPolicy;
