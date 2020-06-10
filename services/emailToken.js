const { PasswordToken, EmailToken } = require('../models/emailToken');

function createEmailToken(userId, token) {
    return EmailToken.create({userId: userId, token: token});
}

function createPasswordToken(userId, token) {
    return PasswordToken.create({ userId: userId, token: token });
}

function getPasswordTokenByUserId(userId) {
    return PasswordToken.findOne({ userId: userId });
}

function getEmailToken(token) {
    return EmailToken.findOne({ token: token });
}

function deletePasswordTokenByUserId(userId) {
    return PasswordToken.findOneAndDelete({ userId: userId });
}

function deleteEmailTokenByUserId(userId) {
    return EmailToken.findOneAndDelete({ userId: userId });
}

module.exports = { 
    deleteEmailTokenByUserId, 
    createEmailToken, 
    createPasswordToken, 
    getEmailToken, 
    getPasswordTokenByUserId, 
    deletePasswordTokenByUserId 
}