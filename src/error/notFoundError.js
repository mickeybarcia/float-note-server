'use strict';

module.exports = function NotFoundError(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.status = 404;
};

require('util').inherits(module.exports, Error);