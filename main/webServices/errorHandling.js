const Error = require('../../core/helpers/error')

const errorHandling = (e, res) => {
  if (e instanceof Error.DataBaseProcessError) {
    console.log('DataBaseProcessError', e)
    res.status(500).send({
      success: false,
      message: 'Erreur Interne'
    })
  }
  if (e instanceof Error.UniqueEntityError) {
    console.log('UniqueEntityError', e)
    let message = ''
    e.details === 'User' ? message = 'Un utilisateurs avec cette email existe déjà' : message = 'Un ' + e.details + ' existe déjà'
    res.status(400).send({
      success: false,
      message
    })
  }
  if (e instanceof Error.PropertyValidationError) {
    console.log('PropertyValidationError', e)
    res.status(400).send({
      success: false,
      message: 'La propriété ' + e.details + ' n\'est pas correct'
    })
  }
  if (e instanceof Error.EntityNotFoundError) {
    console.log('EntityNotFoundError', e)
    res.status(404).send({
      success: false,
      message: e.details + ' not found'
    })
  }
  if (e instanceof Error.InternalProcessError) {
    console.log('InternalProcessError', e)
    res.status(500).send({
      success: false,
      message: 'Erreur Interne'
    })
  }
  res.status(500).send()
}

module.exports = errorHandling
