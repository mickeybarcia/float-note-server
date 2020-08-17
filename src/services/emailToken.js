const { PasswordToken, EmailToken } = require('../models/emailToken');

function createEmailToken(userId) {
    return EmailToken.create({ userId });
}

function createPasswordToken(userId) {
    return PasswordToken.create({ userId });
}

function getPasswordTokenByUserId(userId) {
    return PasswordToken.findOne({ userId });
}

function getEmailToken(token) {
    return EmailToken.findOne({ token });
}

function getPasswordToken(token) {
    return PasswordToken.findOne({ token });
}

function deletePasswordTokenByUserId(userId) {
    return PasswordToken.deleteOne({ userId });
}

function deleteEmailTokenByUserId(userId) {
    return EmailToken.deleteOne({ userId });
}

module.exports = { 
    deleteEmailTokenByUserId, 
    createEmailToken, 
    createPasswordToken, 
    getEmailToken, 
    getPasswordTokenByUserId, 
    deletePasswordTokenByUserId,
    getPasswordToken
};