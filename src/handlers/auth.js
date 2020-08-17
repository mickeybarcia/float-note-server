/**
 * Auth middleware for generating tokens for authenticated users
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { random } = require('./encryptor');
const UnAuthorizedError = require('../error/unauthorizedError');

const SECRET = random();

/**
 * Checks if there is a token
 * and adds the user id to the request if the token is valid
 */
module.exports.verifyToken = (req, res, next) => {
  if (config.env != 'development' && config.env != 'local') {
    var token = req.headers['authorization'];
    if (!token) {
      var err = new Error('No token provided.');
      err.status = 403;
      throw err;
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft();
    }
    try {
      var decoded = jwt.verify(token, SECRET);
    } catch(err) {
      throw new UnAuthorizedError('Invalid token');
    }
    req.userId = decoded.id;
    next();
  } else {
    req.userId = config.testUserId;
    next();
  }
};

/**
 * Signs a JWT 
 * 
 * @param {String} userId the user id to sign the JWT with
 */
module.exports.generateJWT = (userId) => {
  return jwt.sign({ id: userId }, SECRET, { expiresIn: 86400 });
};