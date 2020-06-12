const bcrypt = require('bcryptjs')
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc'

module.exports.random = (num=4) => {
  return crypto.randomBytes(num).toString('hex');
}

module.exports.encryptAes = (key, text) => {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
} 

module.exports.decryptAes = (key, text) => {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
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