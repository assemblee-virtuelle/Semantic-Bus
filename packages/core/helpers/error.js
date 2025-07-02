class PropertyValidationError extends Error {
  constructor(property) {
    super("No property: " + property);
    this.name = "PropertyRequiredError";
    this.details = property;
  }
}
class OauthError extends Error {
  constructor(property) {
    super("No property: " + property);
    this.name = 'Google Oauth';
    this.details = 'vous possedez déjà un compte associé a cette adresse';
  }
}
class InternalProcessError extends Error {
  constructor(details) {
    super("Error: " + details);
    this.name = "InternalProcessError";
    this.details = details;
  }
}

class DataBaseProcessError extends Error {
  constructor(details) {
    super("Error: " + details);
    this.name = "DataBaseProcessError";
    this.details = details;
  }
}


class EntityNotFoundError extends Error {
  constructor(entity) {
    super();
    this.name = "EntityNotFoundError";
    this.details = entity;
  }
}

class UniqueEntityError extends Error {
  constructor(entity) {
    super();
    this.name = "UniqueEntityError";
    this.details = entity;
  }
}


module.exports.OauthError = OauthError
module.exports.DataBaseProcessError = DataBaseProcessError
module.exports.UniqueEntityError = UniqueEntityError
module.exports.PropertyValidationError = PropertyValidationError
module.exports.EntityNotFoundError = EntityNotFoundError
module.exports.InternalProcessError = InternalProcessError