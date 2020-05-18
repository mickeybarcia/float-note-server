const bcrypt = require('bcryptjs')
var crypto = require('crypto');

function encryptAES(key, text){
  var cipher = crypto.createCipher('aes-256-cbc', key);
  crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
} 

function decryptAES(key, text){
  var decipher = crypto.createDecipher('aes-256-cbc', key);
  decoded = decipher.update(text, 'hex', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

function random(num=4) {
  return crypto.randomBytes(num).toString('hex');
}

function checkPassword(reqPassword, realPassword) {
  return bcrypt.compareSync(reqPassword, realPassword);
}

function encryptPassword(password) {
  return bcrypt.hashSync(password, 8);
}

module.exports = {  
  random, 
  checkPassword, 
  encryptPassword,
  encryptAES,
  decryptAES
}
