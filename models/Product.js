const { ObjectId } = require('mongodb');
const { getProductsCollection } = require('../config/database');

class Product {
  // Get all products
  static async findAll() {
    const collection = getProductsCollection();
    return await collection.find({}).toArray();
  }

  // Get single product by ID
  static async findById(id) {
    const collection = getProductsCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Search products by name
  static async searchByName(searchText) {
    const collection = getProductsCollection();
    return await collection.find({ name: searchText }).toArray();
  }

  // Create a new product
  static async create(productData) {
    const collection = getProductsCollection();
    return await collection.insertOne(productData);
  }

  // Update a product
  static async updateById(id, productData) {
    const collection = getProductsCollection();
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };

    const updatedDoc = {
      $set: {
        category: productData.category,
        chef: productData.chef,
        details: productData.details,
        price: productData.price,
        name: productData.name,
        photo: productData.photo,
        taste: productData.taste,
      },
    };

    return await collection.updateOne(filter, updatedDoc, options);
  }

  // Delete a product
  static async deleteById(id) {
    const collection = getProductsCollection();
    return await collection.deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Product;
