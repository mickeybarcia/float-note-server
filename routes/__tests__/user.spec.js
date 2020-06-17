const userRoute = require('../user')
const userService = require('../../services/user')
const keyService = require('../../services/key') 
const emailTokenService = require('../../services/emailToken') 
const encryptor = require('../../handlers/encryptor')
const emailHandler = require('../../handlers/email')
const userUtil = require('../../utils/user')
const authHandler = require('../../handlers/auth')
const UnAuthorizedError = require('../../error/unauthorizedError')
const { NEXT, ENC_DATA_KEY, DATA_KEY, USER_ID } = require('./constants')

jest.mock('../services/user');
jest.mock('../services/key');
jest.mock('../handlers/encryptor');
jest.mock('../handlers/email');
jest.mock('../services/emailToken')
jest.mock('../utils/user');
jest.mock('../handlers/auth');

const RESPONSE = { send: jest.fn() }
const USERNAME = "username"
const EMAIL = "test@test.com"
const PASSWORD = "password"
const MENTAL_HEALTH_STATUS = "status"
const GENDER = "gender"
const AGE = 15
const REGISTER_REQ_BODY = {
  username: USERNAME,
  email: EMAIL,
  password: PASSWORD,
  mentalHealthStatus: MENTAL_HEALTH_STATUS,
  gender: GENDER,
  age: AGE
}
const ENC_PASSWORD = "xxpasswordxx"
const ENC_MENTAL_HEALTH_STATUS = 'xxstatus'
const ENC_GENDER = 'xxgenderxx'
const ENC_TEST_USER = {
  _id: USER_ID,
  username: USERNAME,
  email: EMAIL,
  password: ENC_PASSWORD,
  mentalHealthStatus: ENC_MENTAL_HEALTH_STATUS,
  gender: ENC_GENDER,
  age: AGE,
  encryptedDataKey: ENC_DATA_KEY
}
const DEC_TEST_USER = {
  _id: USER_ID,
  username: USERNAME,
  email: EMAIL,
  password: ENC_PASSWORD,
  mentalHealthStatus: MENTAL_HEALTH_STATUS,
  gender: GENDER,
  age: AGE
}
const EMAIL_TOKEN_VALUE = 'emailToken'
const EMAIL_TOKEN = { token: EMAIL_TOKEN_VALUE }
const AUTH_TOKEN = 'authToken'
const HOST = 'host'

describe('register', () => {
  const req = {
    body: REGISTER_REQ_BODY,
    headers: {
      host: HOST
    }
  } 
  it('creates a user and sends an auth token', async () => {
    userService.getUserByUsername.mockResolvedValue(Promise.resolve(null))
    keyService.generateDataKey.mockResolvedValue(Promise.resolve(ENC_DATA_KEY))
    keyService.decryptDataKey.mockResolvedValue(Promise.resolve(DATA_KEY))
    userUtil.getEncryptedUserValues = jest.fn().mockReturnValue([ ENC_GENDER, ENC_MENTAL_HEALTH_STATUS ]);
    userService.createUser.mockResolvedValue(Promise.resolve(ENC_TEST_USER))
    emailTokenService.createEmailToken.mockResolvedValue(Promise.resolve(EMAIL_TOKEN))
    encryptor.random = jest.fn().mockReturnValue(EMAIL_TOKEN_VALUE)
    emailHandler.sendVerificationEmail.mockResolvedValue(Promise.resolve())
    authHandler.generateJWT = jest.fn().mockReturnValue(AUTH_TOKEN)

    await userRoute.register(req, RESPONSE, NEXT)
    expect(userService.getUserByUsername).toBeCalledWith(USERNAME);
    expect(keyService.decryptDataKey).toBeCalledWith(ENC_DATA_KEY);
    expect(userUtil.getEncryptedUserValues).toBeCalledWith(DATA_KEY, MENTAL_HEALTH_STATUS, GENDER)
    expect(userService.createUser).toBeCalledWith(
      USERNAME, 
      EMAIL,
      ENC_DATA_KEY,
      PASSWORD,
      ENC_MENTAL_HEALTH_STATUS,
      ENC_GENDER,
      AGE
    )
    expect(emailTokenService.createEmailToken).toBeCalledWith(USER_ID, EMAIL_TOKEN_VALUE)
    expect(emailHandler.sendVerificationEmail).toBeCalledWith(EMAIL_TOKEN_VALUE, EMAIL, HOST)
    expect(authHandler.generateJWT).toBeCalledWith(USER_ID)
    expect(RESPONSE.send).toHaveBeenCalledWith({ token: AUTH_TOKEN, isCreated: true});
  });
  it('does not create a user if the username already exists', async () => {
    userService.getUserByUsername.mockResolvedValue(Promise.resolve({}))
    await userRoute.register(req, RESPONSE, NEXT)
    expect(RESPONSE.send).toHaveBeenCalledWith({ isCreated: false});
  });
});

describe('get current user', () => {
  it('gets the user object for the id', async () => {
    const req = { userId: USER_ID }
    userService.getUserById.mockResolvedValue(Promise.resolve(ENC_TEST_USER))
    keyService.decryptDataKey.mockResolvedValue(DATA_KEY)
    userUtil.decryptUser = jest.fn().mockReturnValue(DEC_TEST_USER)
    userUtil.convertModelToObject = jest.fn().mockReturnValue(DEC_TEST_USER)
    await userRoute.getCurrentUser(req, RESPONSE, NEXT)
    expect(userService.getUserById).toHaveBeenCalledWith(USER_ID);
    expect(keyService.decryptDataKey).toHaveBeenCalledWith(ENC_DATA_KEY);
    expect(userUtil.decryptUser).toHaveBeenCalledWith(ENC_TEST_USER, DATA_KEY);
    expect(RESPONSE.send).toHaveBeenCalledWith(DEC_TEST_USER);
  })
})

describe('login', () => {
  const req = { 
    userId: USER_ID,
    body: {
      usernameOrEmail: "username", 
      password: "password"
    }
  }
  it('validates the user password', async () => {
    userUtil.getUserByUsernameOrEmail.mockResolvedValue(Promise.resolve(ENC_TEST_USER))
    emailTokenService.getPasswordTokenByUserId.mockResolvedValue(Promise.resolve(null))
    encryptor.checkPassword = jest.fn().mockReturnValue(true)
    authHandler.generateJWT = jest.fn().mockReturnValue(AUTH_TOKEN)
    await userRoute.login(req, RESPONSE, NEXT)
    expect(userUtil.getUserByUsernameOrEmail).toHaveBeenCalledWith(USERNAME)
    expect(emailTokenService.getPasswordTokenByUserId).toHaveBeenCalledWith(USER_ID)
    expect(encryptor.checkPassword).toHaveBeenCalledWith(PASSWORD, ENC_TEST_USER.password)
    expect(authHandler.generateJWT).toBeCalledWith(USER_ID)
    expect(RESPONSE.send).toHaveBeenCalledWith({ token: AUTH_TOKEN });
  })
  it('validates a temp password', async () => {
    userUtil.getUserByUsernameOrEmail.mockResolvedValue(Promise.resolve(ENC_TEST_USER))
    emailTokenService.getPasswordTokenByUserId.mockResolvedValue(Promise.resolve(EMAIL_TOKEN))
    encryptor.checkPassword = jest.fn().mockReturnValue(true)
    await userRoute.login(req, RESPONSE, NEXT)
    expect(RESPONSE.send).toHaveBeenCalledWith({ validReset: true });
  })
  it('fails if the username or email does not exist', async () => {
    expect.assertions(1);
    userUtil.getUserByUsernameOrEmail = jest.fn().mockReturnValue(null)
    await userRoute.login(req, RESPONSE, NEXT).catch(err => {
      expect(err).toBeInstanceOf(UnAuthorizedError)
    })
  })
  it('fails if the user password is incorrect', async () => {
    expect.assertions(1);
    userUtil.getUserByUsernameOrEmail.mockResolvedValue(Promise.resolve(ENC_TEST_USER))
    emailTokenService.getPasswordTokenByUserId.mockResolvedValue(Promise.resolve(null))
    encryptor.checkPassword = jest.fn().mockReturnValue(false)
    await userRoute.login(req, RESPONSE, NEXT).catch(err => {
      expect(err).toBeInstanceOf(UnAuthorizedError)
    })    
  })
})