module.exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch((err) => {
      console.log(err);
      if (err.res) { 
        err.status = err.res.status; 
      }
      next(err);
    })
  }
};