import db from "../config/db.js";

// const User = {};

const UserModel = {
  create(user) {
    db.users.push(user);
    return user;
  },

  findByUsername(username) {
    return db.users.find((u) => u.username === username);
  },

  findById(id) {
    return db.users.find((u) => u.id === id);
  },

  findByEmail(email) {
    return db.users.find((u) => u.email === email);
  },

  deleteById(id) {
    const index = db.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      return db.users.splice(index, 1)[0];
    }
    return null;
  },

  all() {
    return db.users;
  },

  isUserExists(username, email) {
    return this.findByUsername(username) || this.findByEmail(email);
  },

  generateNextId() {
    const users = db.users;
    return users.length ? users[users.length - 1].id + 1 : 1;
  },

  filterOutAdmins() {
    return db.users.filter((u) => u.role !== "admin");
  },

  update(id, updates) {
    const user = this.findById(id);
    if (!user) return null;

    Object.assign(user, updates);
    return user;
  },

  async findOrCreateUser({ googleId, username, email }) {
    let user = this.findByEmail(email);

    if (!user) {
      const id = this.generateNextId();

      user = {
        id,
        googleId,
        username,
        email,
        passwordHash: await bcrypt.hash(Math.random().toString(36), 10), // password dummy
        role: db.roles[3].name, // misalnya "customer"
        attributes: {
          region: "asia", // default region
          clearance: db.levels[0].name, // misalnya "basic"
        },
        createdAt: new Date(),
      };

      this.create(user);
    }

    return user;
  },
};

export default UserModel;
