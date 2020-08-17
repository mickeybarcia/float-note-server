const User = require('../models/user');

module.exports.USER_ID = '123b6b9b4f4ddef1ad47f943';
module.exports.USERNAME = "username";
module.exports.EMAIL = "test@test.com";
module.exports.PASSWORD = "password";
module.exports.MENTAL_HEALTH_STATUS = "status";
module.exports.GENDER = "gender";
module.exports.AGE = "15";
module.exports.ENC_PASSWORD = "xxpasswordxx";
module.exports.ENC_DATA_KEY = 'xxkeyxx';

module.exports.REGISTER_REQ_BODY = {
  username: module.exports.USERNAME,
  email: module.exports.EMAIL,
  password: module.exports.PASSWORD,
  mentalHealthStatus: module.exports.MENTAL_HEALTH_STATUS,
  gender: module.exports.GENDER,
  age: module.exports.AGE
};

module.exports.USER = User({
  _id: module.exports.USER_ID,
  username: module.exports.USERNAME,
  email: module.exports.EMAIL,
  password: module.exports.ENC_PASSWORD,
  mentalHealthStatus: module.exports.MENTAL_HEALTH_STATUS,
  gender: module.exports.GENDER,
  age: module.exports.AGE,
  encryptedDataKey: module.exports.ENC_DATA_KEY
});

module.exports.EMAIL_TOKEN_VALUE = 'emailToken';
module.exports.EMAIL_TOKEN = { token: module.exports.EMAIL_TOKEN_VALUE };
module.exports.AUTH_TOKEN = 'authToken';
module.exports.HOST = 'host';