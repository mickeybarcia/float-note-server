const bcrypt = require('bcryptjs')
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc'

module.exports.random = (num=4) => {
  return crypto.randomBytes(num).toString('hex');
}

module.exports.encryptAes = (key, text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return iv + crypted;
} 

module.exports.decryptAes = (key, text) => {
  const iv = text.slice(0, 16);
  text = text.slice(16);
  var decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decoded = decipher.update(text, 'hex', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

module.exports.encryptAesBuffer = (key, buffer) => {
  // var cipher = crypto.createCipher(ALGORITHM, key)
  // var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
  // return crypted;
  const iv = crypto.randomBytes(16);
	var cipher = crypto.createCipheriv(ALGORITHM, key, iv);
	const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
	return result;
}

module.exports.decryptAesBuffer = (key, buffer) => {
  // var decipher = crypto.createDecipher(ALGORITHM, key)
  // var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
  // return dec;
  var iv = buffer.slice(0, 16);
	buffer = buffer.slice(16);
	var decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	var result = Buffer.concat([decipher.update(buffer), decipher.final()]);
	return result;
}

module.exports.checkPassword = (reqPassword, realPassword) => {
  return bcrypt.compareSync(reqPassword, realPassword);
}

module.exports.encryptPassword = (password) => {
  return bcrypt.hashSync(password, 8);
}