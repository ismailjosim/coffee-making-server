const User = require('../models/User');

exports.getMe = async (req, res) => {
  res.status(200).send({
    success: true,
    user: req.currentUser,
  });
};

exports.updateMe = async (req, res) => {
  try {
    const updatedUser = await User.updateProfile(req.firebaseUser.uid, req.body);

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    res.status(200).send({
      success: true,
      items: users.length,
      users,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const allowedRoles = ['customer', 'admin', 'staff'];
    const { role } = req.body;

    if (!allowedRoles.includes(role)) {
      return res.status(400).send({
        success: false,
        error: 'Role must be one of: customer, admin, staff',
      });
    }

    const updatedUser = await User.updateRole(req.params.id, role);

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};
