const configuration = require('../../config.json')
const nodemailer = require('nodemailer')

const sendMail = (req, res, mailOptions) => {
  return new Promise(function (resolve, reject) {
    const transporter = nodemailer.createTransport(configuration.smtp, {
      from: mailOptions.from,
      headers: {
        'X-Laziness-level': 1000
      }
    })

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve('MAIL_SENT')
      }
    })
  })
} // <-- sendMail

module.exports.sendMail = sendMail
