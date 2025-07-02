const configuration = require('../../config.json')
const nodemailer = require('nodemailer')

const sendMail = (req, res, mailOptions) => {
  return new Promise(function (resolve, reject) {
    // Verify SMTP configuration exists
    if (!configuration.smtp) {
      const error = new Error('SMTP configuration is missing in config.json')
      console.error('Mail service error:', error.message)
      return reject(error)
    }

    if (!configuration.smtp.auth || !configuration.smtp.auth.user) {
      const error = new Error('SMTP authentication configuration is incomplete')
      console.error('Mail service error:', error.message)
      return reject(error)
    }

    const transporter = nodemailer.createTransport(configuration.smtp)

    mailOptions.from = mailOptions.from || configuration.smtp.auth.user
    mailOptions.headers = {
      'X-Laziness-level': 1000,
      ...mailOptions.headers
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(error)
      } else {
        resolve(info)
      }
    })
  })
}

module.exports.sendMail = sendMail
