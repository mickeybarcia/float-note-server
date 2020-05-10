var nodemailer = require("nodemailer");
const config = require('../config');

var smtpTransport = nodemailer.createTransport({ 
    service: "Gmail",
    secure: false,
    requireTLS: true,
    auth: {
        user: "floatie.ai@gmail.com",
        pass: config.emailPassword
    }
});

module.exports.sendVerificationEmail = async (token, email, host) => {
    var mailOptions = { 
        from: 'floatie.ai@gmail.com', 
        to: email, 
        subject: 'FLOAT NOTE Account Verification Token', 
        text: 'Hello,\n\n Please verify your account by clicking the link: \nhttp:\/\/' + host + '\/verify\/' + token + '.\n' 
    };
    await smtpTransport.sendMail(mailOptions)
}

module.exports.sendForgotPasswordEmail = async (token, email) => {
    var mailOptions = { 
        from: 'floatie.ai@gmail.com', 
        to: email, 
        subject: 'FLOAT NOTE Temporary password', 
        text: 'Hello,\n\n Please login using this temporary password ' + token 
    };
    await smtpTransport.sendMail(mailOptions)
}