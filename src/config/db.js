const InMemoryDB = {
  roles: [
    {
      id: 1,
      name: "admin",
      description: "Administrator with full access",
    },
    {
      id: 2,
      name: "staff",
      description: "Staff member with limited access",
    },
    {
      id: 3,
      name: "seller",
      description: "Seller who can manage their products",
    },
    {
      id: 4,
      name: "customer",
      description: "Customer who can browse and purchase products",
    },
  ],
  levels: [
    {
      id: 1,
      name: "low",
      value: 1,
      description: "Low clearance level",
    },
    {
      id: 2,
      name: "medium",
      value: 2,
      description: "Medium clearance level",
    },
    {
      id: 3,
      name: "high",
      value: 3,
      description: "High clearance level",
    },
  ],
  users: [],
  products: [],
  orders: [],
  orderItems: [],
  refreshTokens: [],
};

export default InMemoryDB;
