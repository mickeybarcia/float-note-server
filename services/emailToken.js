const { PasswordToken, EmailToken } = require('../models/emailToken');

function createEmailToken(userId, token) {
    return EmailToken.create({userId: userId, token: token});
}

function createPasswordToken(userId, token) {
    return PasswordToken.create({ userId: userId, token: token });
}

function getPasswordTokenByUserId(userId) {
    return PasswordToken.findOne({ userId: userId }).exec();
}

function getEmailToken(token) {
    return EmailToken.findOne({ token: token }).exec();
}

function deletePasswordTokenByUserId(userId) {
    return PasswordToken.findOneAndDelete({ userId: userId }).exec();
}

function deleteEmailTokenByUserId(userId) {
    return EmailToken.findOneAndDelete({ userId: userId }).exec();
}

module.exports = { deleteEmailTokenByUserId, createEmailToken, createPasswordToken, getEmailToken, getPasswordTokenByUserId, deletePasswordTokenByUserId }