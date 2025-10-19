import { hashPassword } from "../utils/password.js";
import UserModel from "../models/user.model.js";
import ProductModel from "../models/product.model.js";
import { OrderModel } from "../models/order.model.js";

const UserController = {
  list: (req, res) => {
    const user = req.user;

    // if user staff cannot see admin users
    const users =
      user.role === "staff" ? UserModel.filterOutAdmins() : UserModel.all();

    res.json(users);
  },

  create: (req, res) => {
    const { username, email, password, role, attributes } = req.body;

    // basic validation
    if (!username || !email || !password)
      return res
        .status(400)
        .json({ error: "username,email,password required" });

    // check if user staff cannot create admin users
    const user = req.user;
    if (user.role === "staff" && role === "admin")
      return res
        .status(403)
        .json({ error: "Forbidden: cannot create admin and staff users" });

    // check if user exists by username
    if (UserModel.isUserExists(username, email))
      return res.status(409).json({ error: "User or email already exists" });

    // hash password
    const hash = hashPassword(password);

    const newUser = {
      id: UserModel.generateNextId(),
      username,
      email,
      passwordHash: hash,
      role,
      attributes: attributes || { region: "global", clearance: "low" },
    };

    UserModel.create(newUser);

    res.status(201).json({
      message: "User created",
      user: { id: newUser.id, username: newUser.username, role: newUser.role },
    });
  },

  update: (req, res) => {
    const id = parseInt(req.params.id);
    const { username, email, password, role, attributes } = req.body;

    // basic validation
    if (!id) return res.status(400).json({ error: "Invalid user id" });

    // find user
    const user = UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // check if username/email is taken by other user
    if (username && username !== user.username) {
      if (UserModel.findByUsername(username))
        return res.status(409).json({ error: "Username is exists" });
      user.username = username;
    }
    if (email && email !== user.email) {
      if (UserModel.findByEmail(email))
        return res.status(409).json({ error: "Email is exists" });
      user.email = email;
    }

    if (password) {
      user.passwordHash = hashPassword(password);
    }

    if (role) user.role = role;

    if (attributes) user.attributes = attributes;

    res.json({
      message: "User updated",
      user: { id: user.id, username: user.username, role: user.role },
    });
  },

  delete: (req, res) => {
    const id = parseInt(req.params.id);

    // basic validation
    if (!id) return res.status(400).json({ error: "Invalid user id" });

    // find user
    const user = UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // delete user
    UserModel.deleteById(id);
    // delete user's products
    ProductModel.deleteByUserId(id);
    // delete user's orders
    OrderModel.deleteByUserId(id);

    res.json({ message: "User deleted" });
  },
};

export default UserController;
