const crypto = require('crypto');

// Generate random token
exports.generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

// Format response data
exports.formatResponse = (data, message = '', success = true) => {
  return {
    success,
    message,
    data
  };
};

// Paginate results
exports.paginate = (model, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    ...model,
    limit,
    offset,
    totalPages: Math.ceil(model.count / limit),
    currentPage: page
  };
};