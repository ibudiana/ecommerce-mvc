import bcrypt from "bcryptjs";
import db from "../config/db.js";

export default async function seed() {
  //User seeding
  const admin = {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    passwordHash: await bcrypt.hash("admin123", 10),
    role: db.roles[0].name,
    attributes: { region: "global", clearance: db.levels[2].name },
  };

  // Staff with different clearance levels
  const staffLevelOne = {
    id: 2,
    username: "staff_a",
    email: "staff_a@example.com",
    passwordHash: await bcrypt.hash("staff123", 10),
    role: db.roles[1].name,
    attributes: { region: "global", clearance: db.levels[0].name },
  };
  const staffLevelTwo = {
    id: 3,
    username: "staff_b",
    email: "staff_b@example.com",
    passwordHash: await bcrypt.hash("staff123", 10),
    role: db.roles[1].name,
    attributes: { region: "global", clearance: db.levels[1].name },
  };
  const staffLevelThree = {
    id: 4,
    username: "staff_c",
    email: "staff_c@example.com",
    passwordHash: await bcrypt.hash("staff123", 10),
    role: db.roles[1].name,
    attributes: { region: "global", clearance: db.levels[2].name },
  };

  const seller = {
    id: 5,
    username: "seller_a",
    email: "seller_a@example.com",
    passwordHash: await bcrypt.hash("seller123", 10),
    role: db.roles[2].name,
    attributes: { region: "asia", clearance: db.levels[0].name },
  };

  const customerOne = {
    id: 6,
    username: "customer_a",
    email: "customer_a@example.com",
    passwordHash: await bcrypt.hash("customer123", 10),
    role: db.roles[3].name,
    attributes: { region: "asia", clearance: db.levels[0].name },
  };

  const customerTwo = {
    id: 7,
    username: "customer_b",
    email: "customer_b@example.com",
    passwordHash: await bcrypt.hash("customer123", 10),
    role: db.roles[3].name,
    attributes: { region: "asia", clearance: db.levels[0].name },
  };

  db.users.push(
    admin,
    staffLevelOne,
    staffLevelTwo,
    staffLevelThree,
    seller,
    customerOne,
    customerTwo
  );

  // Product seeding
  const products = [
    {
      id: 1,
      name: "T-Shirt A - Global",
      price: 1000,
      stock: 30,
      region: "global",
      approved: true,
      userId: 1,
    },
    {
      id: 2,
      name: "T-Shirt B - Global",
      price: 1000,
      stock: 10,
      region: "global",
      approved: true,
      userId: 1,
    },
    {
      id: 3,
      name: "T-Shirt C - Global",
      price: 1000,
      stock: 60,
      region: "global",
      approved: true,
      userId: 1,
    },
    {
      id: 4,
      name: "T-Shirt A - Asia",
      price: 5000,
      stock: 10,
      region: "asia",
      approved: false,
      userId: 5,
    },
    {
      id: 5,
      name: "T-Shirt B - Asia",
      price: 5000,
      stock: 10,
      region: "asia",
      approved: true,
      userId: 5,
    },
    {
      id: 6,
      name: "T-Shirt C - Asia",
      price: 5000,
      stock: 10,
      region: "asia",
      approved: true,
      userId: 5,
    },
  ];

  db.products.push(...products);

  // Order seeding
  const orders = [
    {
      id: 1,
      userId: 6,
      createdAt: new Date("2025-10-10T10:00:00Z"),
    },
    {
      id: 2,
      userId: 7,
      createdAt: new Date("2025-10-11T12:30:00Z"),
    },
  ];

  db.orders.push(...orders);

  // OrderItems seeding
  const orderItems = [
    // Order 1 by customer 6
    {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 2,
    },
    {
      id: 2,
      orderId: 1,
      productId: 3,
      quantity: 1,
    },

    // Order 2 by customer 7
    {
      id: 3,
      orderId: 2,
      productId: 3,
      quantity: 3,
    },
  ];

  db.orderItems.push(...orderItems);

  console.log("Seeding completed.");
}
