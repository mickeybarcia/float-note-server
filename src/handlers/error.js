/**
 * Middleware for catching, logging, and returning errors 
 */
module.exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch((err) => {
      module.exports.logError(err, req);
      next(err);
    });
  };
};

module.exports.logError = (err, req) => {
  console.log({
    error: err.message,
    stack: err.status ? err.stack : null,  // don't log specific error messages for non handled errors
    body: JSON.stringify(req.body),
    method: req.method,
    url: req.originalUrl
  });
};

module.exports.logErrorMessage = (message, req) => {
  console.log({
    error: message,
    body: JSON.stringify(req.body),
    method: req.method,
    url: req.originalUrl
  });
};

module.exports.errorHandler = (err, req, res, next) => {
  if (err.retrySecs != null) {
    res.set('Retry-After', String(err.retrySecs));
  }
  res.status(err.status || 500).send({  // don't log specific error messages for non handled errors
    'Error': err.status ? err.message : 'An internal error occured'  
  });
}

process.on('unhandledRejection', (err) => {
  throw err;
});

process.on('uncaughtException', (err) => {
  console.log({ error: 'Uncaught exception: ' + err })
  // email
  // process.exit(1)
});