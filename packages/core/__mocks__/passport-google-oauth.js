// Mock de Passport Google OAuth pour les tests
module.exports = {
  OAuth2Strategy: class OAuth2Strategy {
    constructor(options, verify) {
      this.options = options;
      this.verify = verify;
    }
  }
}; 