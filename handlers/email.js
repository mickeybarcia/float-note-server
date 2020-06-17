/**
 * Handles account emails
 */

var nodemailer = require("nodemailer");
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")
const config = require('../config');

const ACCOUNT_EMAIL = 'floatie.ai@gmail.com'

var smtpTransport = nodemailer.createTransport({ 
    service: "SendinBlue",
    secure: false,  // TODO configure
    requireTLS: true,
    auth: {
        user: ACCOUNT_EMAIL,
        pass: config.emailPassword
    }
});

const TEMPLATE_DIR = path.join(__dirname + '/../templates')
const LOGO_ATTACHMENT = {
    filename: 'logo.png',
    path: __dirname +'/../assets/logo.png',
    cid: 'logo'
}

const verifyTemplateSource = fs.readFileSync(path.join(TEMPLATE_DIR, "/verifyAccount.handlebars"), "utf8")
const verifyTemplate = handlebars.compile(verifyTemplateSource)

const resetPasswordTemplateSource = fs.readFileSync(path.join(TEMPLATE_DIR, "/resetPassword.handlebars"), "utf8")
const resetPasswordTemplate = handlebars.compile(resetPasswordTemplateSource)

/**
 * Sends an account verification email for a user
 * 
 * @param {String} token the email token for the url
 * @param {String} email the user's email to send to
 * @param {String} host the url host to verify the account
 */
module.exports.sendVerificationEmail = async (token, email, host) => {
    const htmlToSend = verifyTemplate({ 
        url: "http://" + host + "/api/v1/verify/" + token
    })
   var mailOptions = { 
        from: ACCOUNT_EMAIL, 
        to: email, 
        subject: 'FLOAT NOTE 🖋 Account Verification', 
        html: htmlToSend,
        attachments: [ LOGO_ATTACHMENT ]
    };
    smtpTransport.sendMail(mailOptions)
}

/**
 * Sends a temporary password email
 * 
 * @param {String} token the temporary password in the email
 * @param {String} email the user's email to send to
 */
module.exports.sendForgotPasswordEmail = async (token, email) => {
    const htmlToSend = resetPasswordTemplate({ 
        token: token
    })
   var mailOptions = { 
        from: ACCOUNT_EMAIL, 
        to: email, 
        subject: 'FLOAT NOTE 🖋 Password Reset', 
        html: htmlToSend,
        attachments: [ LOGO_ATTACHMENT ]
    };
    smtpTransport.sendMail(mailOptions)
}