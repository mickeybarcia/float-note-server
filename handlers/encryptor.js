var crypto = require('crypto');
const config = require('../config');
const bcrypt = require('bcryptjs')

function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc', config.diarySecret);
  crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
} 

function decrypt(text){
  if (text === null || typeof text === 'undefined') { return text; };
  var decipher = crypto.createDecipher('aes-256-cbc', config.diarySecret);
  decoded = decipher.update(text, 'hex', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

function random() {
  return crypto.randomBytes(4).toString('hex');
}

function checkPassword(reqPassword, realPassword) {
  return bcrypt.compareSync(reqPassword, realPassword);
}

function encryptPassword(password) {
  return bcrypt.hashSync(password, 8);
}

module.exports = { encrypt, decrypt, random, checkPassword, encryptPassword }
