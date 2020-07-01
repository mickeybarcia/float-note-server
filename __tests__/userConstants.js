module.exports.USER_ID = '123'
module.exports.USERNAME = "username"
module.exports.EMAIL = "test@test.com"
module.exports.PASSWORD = "password"
module.exports.MENTAL_HEALTH_STATUS = "status"
module.exports.GENDER = "gender"
module.exports.AGE = 15
module.exports.REGISTER_REQ_BODY = {
  username: module.exports.USERNAME,
  email: module.exports.EMAIL,
  password: module.exports.PASSWORD,
  mentalHealthStatus: module.exports.MENTAL_HEALTH_STATUS,
  gender: module.exports.GENDER,
  age: module.exports.AGE
}
module.exports.ENC_PASSWORD = "xxpasswordxx"
module.exports.ENC_MENTAL_HEALTH_STATUS = 'xxstatus'
module.exports.ENC_GENDER = 'xxgenderxx'
module.exports.ENC_TEST_USER = {
  _id: module.exports.USER_ID,
  username: module.exports.USERNAME,
  email: module.exports.EMAIL,
  password: module.exports.ENC_PASSWORD,
  mentalHealthStatus: module.exports.ENC_MENTAL_HEALTH_STATUS,
  gender: module.exports.ENC_GENDER,
  age: module.exports.AGE,
  encryptedDataKey: module.exports.ENC_DATA_KEY
}
module.exports.DEC_TEST_USER = {
  _id: module.exports.USER_ID,
  username: module.exports.USERNAME,
  email: module.exports.EMAIL,
  password: module.exports.ENC_PASSWORD,
  mentalHealthStatus: module.exports.MENTAL_HEALTH_STATUS,
  gender: module.exports.GENDER,
  age: module.exports.AGE
}
module.exports.EMAIL_TOKEN_VALUE = 'emailToken'
module.exports.EMAIL_TOKEN = { token: module.exports.EMAIL_TOKEN_VALUE }
module.exports.AUTH_TOKEN = 'authToken'
module.exports.HOST = 'host'