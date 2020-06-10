const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports.verifyToken = (req, res, next) => {
  if (config.env == 'production') {
    var token = req.headers['authorization'];
    if (!token) {
      var err = new Error('No token provided.');
      err.status = 403;
      throw err;
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }
    jwt.verify(token, config.tokenSecret, function(err, decoded) {
      req.userId = decoded.id;
      next();
    });
  } else {
    req.userId = config.testUserId;
    next();
  }
}

module.exports.generateJWT = (userId) => {
  return jwt.sign({ id: userId }, config.tokenSecret, { expiresIn: 86400 });
}