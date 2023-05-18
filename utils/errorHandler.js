
const AppError = function(name, httpCode, description) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = name;
  this.httpCode = httpCode;
  this.description = description;
};

AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;


const errorHandlers = {
  handleError(err, res) {
    console.log(err)
    res.status(err?.httpCode || 500 ).json({error:{ name: err.name, message: err.description }})
  },
}

export { errorHandlers , AppError };
