import { OrderModel, OrderModelItem } from "../models/order.model.js";
import ProductModel from "../models/product.model.js";

const OrderController = {
  list: (req, res) => {
    const orders = OrderModel.all(req.user);
    res.json(orders);
  },

  listById: (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid order id" });

    const order = OrderModel.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  },

  create: (req, res) => {
    const { userId, orderItems } = req.body;

    // Basic validation
    if (!userId || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res
        .status(400)
        .json({ error: "userId and orderItems are required" });
    }

    // Simpan orderId, item yang berhasil dibuat, dan stok yang diubah
    const idOrder = OrderModel.generateNextId();
    const createdItems = [];
    const updatedStocks = [];

    try {
      // Create order
      const newOrder = {
        id: idOrder,
        userId,
        createdAt: new Date(),
      };

      OrderModel.create(newOrder);

      // Loop order items
      for (const item of orderItems) {
        const { productId, quantity } = item;

        if (!productId || !quantity) {
          throw new Error("productId and quantity are required in orderItems");
        }

        // Temukan produk
        const product = ProductModel.findById(productId);
        if (!product) {
          throw new Error(`Product ID ${productId} not found`);
        }

        // Cek stok
        const parsedQty = parseInt(quantity);
        if (product.stock < parsedQty) {
          throw new Error(`Insufficient stock for product ID ${productId}`);
        }

        // Kurangi stok
        ProductModel.update(productId, {
          stock: product.stock - parsedQty,
        });

        updatedStocks.push({ productId, previousStock: product.stock });

        // Buat order item
        const orderItem = {
          id: OrderModelItem.generateNextId(),
          orderId: idOrder,
          productId,
          quantity: parsedQty,
        };

        OrderModelItem.create(orderItem);
        createdItems.push(orderItem);
      }

      // Sukses
      return res.status(201).json({
        message: "Order created successfully",
        order: {
          id: idOrder,
          userId,
          createdAt: new Date(),
        },
        //   find order items
        items: OrderModel.findById(idOrder).items,
      });
    } catch (err) {
      console.error("Gagal membuat order:", err.message);

      // Rollback: kembalikan stok
      for (const stock of updatedStocks) {
        ProductModel.update(stock.productId, {
          stock: stock.previousStock,
        });
      }

      // Rollback: hapus item yang berhasil dibuat
      for (const item of createdItems) {
        OrderModelItem.delete(item.id);
      }

      // Rollback: hapus order utama
      OrderModel.delete(idOrder);

      return res.status(500).json({ error: err.message });
    }
  },

  //   create: (req, res) => {
  //     const { userId, orderItems } = req.body;

  //     // Basic validation
  //     if (!userId || !Array.isArray(orderItems) || orderItems.length === 0) {
  //       return res
  //         .status(400)
  //         .json({ error: "userId and orderItems are required" });
  //     }

  //     // Create new order
  //     const idOrder = OrderModel.generateNextId();

  //     const newOrder = {
  //       id: idOrder,
  //       userId,
  //       createdAt: new Date(),
  //     };

  //     OrderModel.create(newOrder);

  //     // Create new order with item loop
  //     for (const item of orderItems) {
  //       const { productId, quantity } = item;
  //       if (!productId || !quantity) {
  //         return res
  //           .status(400)
  //           .json({ error: "productId and quantity are required in orderItems" });
  //       }

  //       // Check if product exists
  //       const product = ProductModel.findById(productId);
  //       if (!product) {
  //         return res
  //           .status(404)
  //           .json({ error: `Product ID ${productId} not found` });
  //       }

  //       // Check stock availability
  //       if (product.stock < quantity) {
  //         return res
  //           .status(400)
  //           .json({ error: `Insufficient stock for product ID ${productId}` });
  //       }

  //       // Deduct stock
  //       ProductModel.update(productId, { stock: product.stock - quantity });

  //       // Create order item
  //       const orderItem = {
  //         id: OrderModelItem.generateNextId(),
  //         orderId: idOrder,
  //         productId,
  //         quantity: parseInt(quantity),
  //       };
  //       OrderModelItem.create(orderItem);
  //     }

  //     res.status(201).json({
  //       message: "Order created",
  //       order: {
  //         id: newOrder.id,
  //         userId: newOrder.userId,
  //         createdAt: newOrder.createdAt,
  //       },
  //       //   find order items
  //       items: OrderModel.findById(idOrder).items,
  //     });
  //   },
};

export default OrderController;
