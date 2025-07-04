const Error = require('./error');

const errorHandling = (e, res) => {
  if (e instanceof Error.DataBaseProcessError) {
    console.log('DataBaseProcessError', e);
    res.status(500).send({
      success: false,
      message: 'Erreur Interne'
    });
  } else if (e instanceof Error.UniqueEntityError) {
    console.log('UniqueEntityError', e);
    let message = '';
    e.details === 'User' ? message = 'Un utilisateur avec cet email existe déjà' : message = 'Un ' + e.details + ' existe déjà';
    res.status(400).send({
      success: false,
      message
    });
  } else if (e instanceof Error.PropertyValidationError) {
    console.log('PropertyValidationError', e);
    res.status(400).send({
      success: false,
      message: 'La propriété ' + e.details + ' n\'est pas correcte'
    });
  }else if (e instanceof Error.EntityNotFoundError) {
    console.log('EntityNotFoundError', e);
    res.status(404).send({
      success: false,
      message: e.details + ' non trouvé'
    });
  }else if (e instanceof Error.InternalProcessError) {
    console.log('InternalProcessError', e);
    res.status(500).send({
      success: false,
      message: 'Erreur Interne'
    });
  }else if (e instanceof Error.OauthError) {
    console.log('OauthError', e);
    res.status(500).send({
      success: false,
      message: e.details
    });
  }else{
    console.log('Other eror', e);
    const message = e.details || e.displayMessage || e.message;
    res.status(500).send({
      success: false,
      message: 'Erreur Interne : ' + message
    });
  }
};

module.exports = errorHandling;
