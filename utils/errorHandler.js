
const AppError = function(type, detail, description) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.type = type;
  this.detail = detail;
  this.description = description;
};

AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;


// const DbError = function(err) {
//   Error.call(this);
//   Error.captureStackTrace(this, this.constructor);
//   this.err = err;
// };

// DbError.prototype = Object.create(Error.prototype);
// DbError.prototype.constructor = DbError;


const errorHandlers = {
  handleError(err, res) {
    res.status(err?.type || 500 ).json({error:{ error_detail: err.detail, description: err.description }})
  },
  handleDbCastError(err, res){
    res.status(400).json({ error: { error_detail: `Invalid ${err.path} value`, description: err.reason} })
  },
  handleDbValidationError(err, res) {
    const propertyNames = Object.keys(err.errors);
    const firstPropertyName = propertyNames[0];
    const firstPropertyValue = err.errors[firstPropertyName];
    res.status(400).json({ error: {error_detail: 'badRequest', description: `${firstPropertyValue.stringValue} is invalid`}})
  }
}

export { errorHandlers , AppError };
