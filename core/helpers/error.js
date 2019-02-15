class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  }
  
class PropertyRequiredError extends ValidationError {
    constructor(property) {
      super("No property: " + property);
      this.name = "PropertyRequiredError";
      this.property = property;
    }
  }

class PropertyValidationError extends ValidationError {
  constructor(property) {
    super("No property: " + property);
    this.name = "PropertyRequiredError";
    this.property = property;
  }
}

class InternalProcessError extends ValidationError {
  constructor(details) {
    super("Error: " + details);
    this.name = "InternalProcessError";
    this.details = details;
  }
}

class DataBaseProcessError extends ValidationError {
  constructor(details) {
    super("Error: " + details);
    this.name = "DataBaseProcessError";
    this.details = details;
  }
}


class EntityNotFoundError extends ValidationError {
  constructor(entity) {
    super();
    this.name = "EntityNotFoundError";
    this.details = entity;
  }
}

class UniqueEntityError extends ValidationError {
  constructor(entity) {
    super();
    this.name = "UniqueEntityError";
    this.details = entity;
  }
}


  module.exports.DataBaseProcessError = DataBaseProcessError
  module.exports.UniqueEntityError = UniqueEntityError
  module.exports.PropertyValidationError = PropertyValidationError
  module.exports.EntityNotFoundError = EntityNotFoundError
  module.exports.ValidationError = ValidationError
  module.exports.InternalProcessError = InternalProcessError
  module.exports.PropertyRequiredError = PropertyRequiredError