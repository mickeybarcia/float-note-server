/**
 * Middleware for catching and returning errors 
 */
module.exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch((err) => {
      logError(err, req);
      if (err.res) { 
        err.status = err.res.status; 
      }
      next(err);
    })
  }
};

function logError(err, req) {
  console.log({
    error: err.message,
    stack: err.stack,
    body: JSON.stringify(req.body),
    method: req.method,
    url: req.originalUrl
  });
}