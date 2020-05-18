const aws = require('aws-sdk')
const config = require('../config');

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

  module.exports = { decryptDataKey, generateDataKey }