const db = require('../models');

module.exports = (modelName, idParam = 'id', ownerField = 'user_id') => {
  return async (req, res, next) => {
    try {
      const model = db[modelName];
      if (!model) {
        return res.status(500).json({ error: 'Invalid model specified' });
      }
      
      const recordId = req.params[idParam];
      const record = await model.findByPk(recordId);
      
      if (!record) {
        return res.status(404).json({ error: 'Record not found' });
      }
      
      // Check if user is owner or admin
      if (req.user.role !== 'admin' && record[ownerField] !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized to access this resource' });
      }
      
      req.record = record;
      next();
    } catch (error) {
      next(error);
    }
  };
};