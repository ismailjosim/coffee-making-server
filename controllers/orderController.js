const Order = require('../models/Order');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).send({
      success: true,
      items: orders.length,
      orders: orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).send({
        success: false,
        error: 'Order not found',
      });
    }

    res.status(200).send({
      success: true,
      order: order,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send({
        success: false,
        error: 'Order data is required',
      });
    }

    const result = await Order.create(data);
    res.status(201).send({
      success: true,
      message: 'Order created successfully',
      order: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).send({
        success: false,
        error: 'Order data is required for update',
      });
    }

    const result = await Order.updateById(id, updatedData);

    res.status(200).send({
      success: true,
      message: 'Order updated successfully',
      order: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Order.deleteById(id);

    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        error: 'Order not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'Order deleted successfully',
      result: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};
