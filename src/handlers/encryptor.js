/**
 * Encrypts and decrypts stored data
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SALT_ROUNDS = 8;

/**
 * Generates a random string
 * 
 * @param {Number} num number of bytes
 * 
 * @return {String}
 */
module.exports.random = (num=4) => {
  return crypto.randomBytes(num).toString('hex');
};

/**
 * Encrypts a string
 * 
 * @param {String} key
 * @param {String} text
 * 
 * @return {String}
 */
module.exports.encryptAes = (key, text) => {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}; 

/**
 * Decrypts a string
 * 
 * @param {String} key
 * @param {String} text
 * 
 * @return {String}
 */
module.exports.decryptAes = (key, text) => {
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
  let decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
};

/**
 * Encrypts a buffer
 * 
 * @param {String} key
 * @param {Buffer} buffer
 * 
 * @return {Buffer}
 */
module.exports.encryptAesBuffer = (key, buffer) => {
  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
	const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
	return result;
};

/**
 * Decrypts a buffer
 * 
 * @param {String} key
 * @param {Buffer} buffer
 * 
 * @return {Buffer}
 */
module.exports.decryptAesBuffer = (key, buffer) => {
  var iv = buffer.slice(0, 16);
	buffer = buffer.slice(16);
	var decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
	var result = Buffer.concat([decipher.update(buffer), decipher.final()]);
	return result;
};


/**
 * Compares passwords
 * 
 * @param {String} reqPassword
 * @param {String} realPassword
 * 
 * @return {Boolean}
 */
module.exports.checkPassword = (reqPassword, realPassword) => {
  return bcrypt.compareSync(reqPassword, realPassword);
};

/**
 * Encrypts a password
 * 
 * @param {String} password
 * 
 * @return {String}
 */
module.exports.encryptPassword = (password) => {
  return bcrypt.hashSync(password, SALT_ROUNDS);
};