var nodemailer = require("nodemailer");
const handlebars = require("handlebars")
const config = require('../config');
const fs = require("fs")
const path = require("path")

var smtpTransport = nodemailer.createTransport({ 
    service: "SendinBlue",
    secure: false,
    requireTLS: true,
    auth: {
        user: "floatie.ai@gmail.com",
        pass: config.emailPassword
    }
});

const TEMPLATE_DIR = path.join(__dirname + '/../templates')
const ACCOUNT_EMAIL = 'floatie.ai@gmail.com'
const LOGO_ATTACHMENT = {
    filename: 'logo.png',
    path: __dirname +'/../assets/logo.png',
    cid: 'logo'
}

const verifyTemplateSource = fs.readFileSync(path.join(TEMPLATE_DIR, "/verifyAccount.handlebars"), "utf8")
const verifyTemplate = handlebars.compile(verifyTemplateSource)

const resetPasswordTemplateSource = fs.readFileSync(path.join(TEMPLATE_DIR, "/resetPassword.handlebars"), "utf8")
const resetPasswordTemplate = handlebars.compile(resetPasswordTemplateSource)

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