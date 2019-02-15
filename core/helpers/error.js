export class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  }
  
export class PropertyRequiredError extends ValidationError {
    constructor(property) {
      super("No property: " + property);
      this.name = "PropertyRequiredError";
      this.property = property;
    }
  }

export class InternalProcessError extends ValidationError {
  constructor(details) {
    super("Error: " + details);
    this.name = "InternalProcessError";
    this.details = details;
  }
}

export class DataBaseProcessError extends ValidationError {
  constructor(details) {
    super("Error: " + details);
    this.name = "DataBaseProcessError";
    this.details = details;
  }
}


  module.exports.ValidationError = ValidationError
  module.exports.InternalProcessError = InternalProcessError
  module.exports.PropertyRequiredError = PropertyRequiredError