const config = require('../config');
const bcrypt = require('bcryptjs')
const aws = require('aws-sdk')
var crypto = require('crypto');

const kms = new aws.KMS({
  accessKeyId: config.kms.accessKeyId,
  secretAccessKey: config.kms.secretAccessKey,
  region: 'us-east-2'
});

async function generateDataKey() {
  return new Promise((resolve, reject) => {
    const params = {
        KeyId: config.kms.masterkeyId, 
        KeySpec: 'AES_256'
    };
    kms.generateDataKey(params, (err, data) => {
        if (err) {
            reject(Error('Unable to generate data key: ' + err.name));
        } else {
            resolve(data.CiphertextBlob);
        }
    });
});
}

function encryptDiary(text, dataKey) {
  return encryptAES(dataKey, text);
}

function decryptDiary(text, dataKey) {
  return decryptAES(dataKey, text)
}

async function decryptDataKey(buffer) {
  return new Promise((resolve, reject) => {
      const params = {
          CiphertextBlob: buffer
      };
      kms.decrypt(params, (err, data) => {
          if (err) {
              reject(Error('Unable to decrypt data key: ' + err.name));
          } else {
              resolve(data.Plaintext);
          }
      });
  });
}

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
  generateDataKey, 
  decryptDataKey, 
  encryptDiary, 
  decryptDiary, 
  decryptDataKey, 
  random, 
  checkPassword, 
  encryptPassword 
}
