const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.currentUser && req.currentUser.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).send({
        success: false,
        error: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

module.exports = requireRole;
