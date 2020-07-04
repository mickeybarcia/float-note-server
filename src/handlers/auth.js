/**
 * Auth middleware for generating tokens for authenticated users
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const UnAuthorizedError = require('../error/unauthorizedError')

/**
 * Checks if there is a token
 * and adds the user id to the request if the token is valid
 */
module.exports.verifyToken = (req, res, next) => {
  if (config.env != 'development') {
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
      var decoded = jwt.verify(token, config.tokenSecret);
      req.userId = decoded.id;
      next();
    } catch(err) {
      throw new UnAuthorizedError('Invalid token')
    }
  } else {
    req.userId = config.testUserId;
    next();
  }
}

/**
 * Signs a JWT 
 * 
 * @param {String} userId the user id to sign the JWT with
 */
module.exports.generateJWT = (userId) => {
  return jwt.sign({ id: userId }, config.tokenSecret, { expiresIn: 86400 });
}