const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const requireFirebaseAuth = require('../middleware/requireFirebaseAuth');
const requireRole = require('../middleware/requireRole');

router.get('/me', requireFirebaseAuth, userController.getMe);
router.patch('/me', requireFirebaseAuth, userController.updateMe);

router.get(
  '/',
  requireFirebaseAuth,
  requireRole('admin', 'staff'),
  userController.getAllUsers
);

router.patch(
  '/:id/role',
  requireFirebaseAuth,
  requireRole('admin'),
  userController.updateUserRole
);

module.exports = router;
