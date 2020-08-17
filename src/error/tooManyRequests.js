'use strict';

module.exports = function TooManyRequests(retrySecs) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.retrySecs = retrySecs;
  this.status = 429;
};

require('util').inherits(module.exports, Error);