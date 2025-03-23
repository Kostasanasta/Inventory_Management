// middleware/roleCheck.js
module.exports = function(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};