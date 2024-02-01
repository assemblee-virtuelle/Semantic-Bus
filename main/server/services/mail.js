const configuration = require('../../config.json')
const nodemailer = require('nodemailer')

const sendMail = (req, res, mailOptions) => {
  return new Promise(function (resolve, reject) {
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
