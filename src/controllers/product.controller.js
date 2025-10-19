import ProductModel from "../models/product.model.js";

const ProductController = {
  list: (req, res) => {
    const products = ProductModel.all(req.user);
    res.json(products);
  },

  listById: (req, res) => {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid product id" });

    const product = ProductModel.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  },

  create: (req, res) => {
    const { name, price, stock, region } = req.body;

    // Basic validation
    if (!name || price == null || stock == null || !region) {
      return res
        .status(400)
        .json({ error: "name, price, stock, and region are required" });
    }

    // Check if product already exists
    if (ProductModel.isProductExists(name)) {
      return res.status(409).json({ error: "Product already exists" });
    }

    const newProduct = {
      id: ProductModel.generateNextId(),
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      region,
      approved: false,
      userId: req.user.id,
    };

    ProductModel.create(newProduct);

    res.status(201).json({
      message: "Product created",
      product: {
        id: newProduct.id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        stock: newProduct.stock,
      },
    });
  },

  update: (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price, stock, region, approved } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const product = ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check for name duplication
    if (name && name !== product.name) {
      if (ProductModel.findByName(name)) {
        return res.status(409).json({ error: "Product name already exists" });
      }
      product.name = name;
    }

    if (price != null) product.price = parseFloat(price);
    if (stock != null) product.stock = parseInt(stock);
    if (region) product.region = region;

    // only admin can update approved field
    if (req.user.role === "admin" && approved != null) {
      product.approved = !!approved;
    }

    res.json({
      message: "Product updated",
      product: {
        id: product.id,
        name: product.name,
        region: product.region,
        price: product.price,
        stock: product.stock,
        approved: product.approved,
      },
    });
  },

  delete: (req, res) => {
    const id = parseInt(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Invalid product id" });
    }

    const product = ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    ProductModel.deleteById(id);
    res.json({ message: "Product deleted" });
  },
};

export default ProductController;
