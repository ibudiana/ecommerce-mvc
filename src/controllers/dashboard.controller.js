import axios from "axios";
import { ENV } from "../config/env.js";
import app from "../app.js";
import ProductModel from "../models/product.model.js";

async function allUsers(req) {
  try {
    const token = req.session.user.token;

    const response = await axios.get(`${ENV.HOST_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch {
    return [];
  }
}

async function allProducts(req) {
  try {
    const token = req.session.user.token;

    const response = await axios.get(`${ENV.HOST_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch {
    return [];
  }
}

async function allOrders(req) {
  try {
    const token = req.session.user.token;

    const response = await axios.get(`${ENV.HOST_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch {
    return [];
  }
}

const DashboardController = {
  index: async (req, res) => {
    const message = req.session.message;
    delete req.session.message;

    // Set default tab based on role
    let defaultTab = "";
    if (["admin", "staff"].includes(req.session.user.role)) {
      defaultTab = "user";
    } else if (req.session.user.role === "seller") {
      defaultTab = "product";
    } else if (req.session.user.role === "customer") {
      defaultTab = "order";
    }

    res.render("admin/dashboard", {
      title: "Dashboard",
      users: (await allUsers(req)) || [],
      products: (await allProducts(req)) || [],
      orders: (await allOrders(req)) || [],
      publicProducts: ProductModel.onlyApproved() || [],
      message,
      defaultTab,
    });
  },

  //   User Management
  createUser: async (req, res) => {
    try {
      const token = req.session.user.token;

      await axios.post(
        `${ENV.HOST_URL}/api/users`,
        {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password || "default123",
          role: "customer",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      req.session.message = {
        type: "success",
        text: "User berhasil ditambahkan.",
      };
      res.redirect("/dashboard");
    } catch (err) {
      req.session.message = { type: "error", text: "Gagal menambahkan user." };
      res.redirect("/dashboard");
    }
  },
  updateUser: async (req, res) => {
    const userId = req.params.id;
    const token = req.session.user.token;

    try {
      await axios.put(
        `${ENV.HOST_URL}/api/users/${userId}`,
        {
          username: req.body.name,
          email: req.body.email,
          role: req.body.role,
          password: req.body.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      req.session.message = {
        type: "success",
        text: "User berhasil diperbarui.",
      };
      res.redirect("/dashboard");
    } catch (err) {
      req.session.message = { type: "error", text: "Gagal memperbarui user." };
      res.redirect("/dashboard");
    }
  },
  deleteUser: async (req, res) => {
    const userId = req.params.id;
    const token = req.session.user.token;

    try {
      await axios.delete(`${ENV.HOST_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      req.session.message = {
        type: "success",
        text: "User berhasil dihapus.",
      };
      res.redirect("/dashboard");
    } catch (err) {
      req.session.message = { type: "error", text: "Gagal menghapus user." };
      res.redirect("/dashboard");
    }
  },
  //   Product Management
  createProduct: async (req, res) => {
    try {
      const token = req.session.user.token;

      await axios.post(
        `${ENV.HOST_URL}/api/products`,
        {
          name: req.body.name,
          price: req.body.price,
          stock: req.body.stock,
          region: req.body.region,
          approved: req.body.approved,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      req.session.message = {
        type: "success",
        text: "Product berhasil ditambahkan.",
      };
      res.redirect("/dashboard");
    } catch (err) {
      req.session.message = {
        type: "error",
        text: "Gagal menambahkan product.",
      };
      res.redirect("/dashboard");
    }
  },
  updateProduct: async (req, res) => {
    const productId = req.params.id;
    const token = req.session.user.token;

    try {
      const approved = req.body.approved === "on";
      const test = await axios.put(
        `${ENV.HOST_URL}/api/products/${productId}`,
        {
          name: req.body.name,
          price: req.body.price,
          stock: req.body.stock,
          region: req.body.region,
          approved: approved,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      req.session.message = {
        type: "success",
        text: "Product berhasil diperbarui.",
      };
      res.redirect("/dashboard");
    } catch (err) {
      req.session.message = {
        type: "error",
        text: "Gagal memperbarui product.",
      };
      res.redirect("/dashboard");
    }
  },
  deleteProduct: async (req, res) => {
    const productId = req.params.id;
    const token = req.session.user.token;

    try {
      await axios.delete(`${ENV.HOST_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      req.session.message = {
        type: "success",
        text: "Product berhasil dihapus.",
      };
      res.redirect("/dashboard");
    } catch (err) {
      req.session.message = { type: "error", text: "Gagal menghapus product." };
      res.redirect("/dashboard");
    }
  },

  //   Order Management
  createOrder: async (req, res) => {
    try {
      const token = req.session.user.token;

      // if role not admin and customer
      if (!["admin", "customer"].includes(req.session.user.role)) {
        req.session.message = {
          type: "error",
          text: "Hanya admin dan customer yang dapat membuat order.",
        };
        return res.redirect("/dashboard");
      }

      // Parse order items from the form data
      const orderItems = req.body.orderItems;
      const parsedItems = orderItems[0].productId.map((_, i) => ({
        productId: Number(orderItems[0].productId[i]),
        quantity: Number(orderItems[0].quantity[i]),
      }));

      if (parsedItems.length === 0) {
        req.session.message = {
          type: "error",
          text: "Order harus memiliki setidaknya satu item.",
        };
        return res.redirect("/dashboard");
      }

      const newOrder = await axios.post(
        `${ENV.HOST_URL}/api/orders`,
        {
          userId: req.session.user.id,
          orderItems: parsedItems,
          parsedItems,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      req.session.message = {
        type: "success",
        text: "Order berhasil dibuat.",
      };
      res.redirect("/dashboard");
    } catch (err) {
      req.session.message = { type: "error", text: "Gagal membuat order." };
      res.redirect("/dashboard");
    }
  },
};

export default DashboardController;
