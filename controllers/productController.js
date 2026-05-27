const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).send({
      success: true,
      items: products.length,
      products: products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send({
        success: false,
        error: 'Product not found',
      });
    }

    res.status(200).send({
      success: true,
      product: product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Search products by name
exports.searchProducts = async (req, res) => {
  try {
    const searchText = req.params.data;
    const results = await Product.searchByName(searchText);

    res.status(200).send({
      success: true,
      items: results.length,
      products: results,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send({
        success: false,
        error: 'Product data is required',
      });
    }

    const result = await Product.create(data);
    res.status(201).send({
      success: true,
      message: 'Product created successfully',
      product: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).send({
        success: false,
        error: 'Product data is required for update',
      });
    }

    const result = await Product.updateById(id, updatedData);

    res.status(200).send({
      success: true,
      message: 'Product updated successfully',
      product: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Product.deleteById(id);

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        error: 'Product not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'Product deleted successfully',
      result: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};
