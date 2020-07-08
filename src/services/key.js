const aws = require('aws-sdk')
const config = require('../config');

const kms = new aws.KMS({
    accessKeyId: config.kms.accessKeyId,
    secretAccessKey: config.kms.secretAccessKey,
    region: 'us-east-2'
  });
  
async function generateDataKey() {
  try {
      const params = {
          KeyId: config.kms.dataMasterKeyId, 
          KeySpec: 'AES_256'
      }
      let data = await kms.generateDataKey(params).promise();
      return data.CiphertextBlob
    } catch (err) {
      throw Error('Unable to generate data key: ' + err.name)
    }
}



async function decryptDataKey(buffer) {
  try {
      const params = { CiphertextBlob: buffer };
      const data = await kms.decrypt(params).promise()
      return data.Plaintext
  } catch (err) {
      throw new Error('Unable to decrypt data key: ' + err.name)
  }
}

module.exports = { 
    decryptDataKey, 
    generateDataKey
}