const { ObjectId } = require('mongodb');
const { getOrdersCollection } = require('../config/database');

class Order {
  // Get all orders
  static async findAll() {
    const collection = getOrdersCollection();
    return await collection.find({}).toArray();
  }

  // Get single order by ID
  static async findById(id) {
    const collection = getOrdersCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Create a new order
  static async create(orderData) {
    const collection = getOrdersCollection();
    return await collection.insertOne(orderData);
  }

  // Update an order
  static async updateById(id, orderData) {
    const collection = getOrdersCollection();
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };

    const updatedDoc = {
      $set: orderData,
    };

    return await collection.updateOne(filter, updatedDoc, options);
  }

  // Delete an order
  static async deleteById(id) {
    const collection = getOrdersCollection();
    return await collection.deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Order;
