const userRoute = require('../routes/user')
const userService = require('../services/user')
const keyService = require('../services/key') 
const emailTokenService = require('../services/emailToken') 
const encryptor = require('../handlers/encryptor')
const emailHandler = require('../handlers/email')
const userUtil = require('../util/user')
const authHandler = require('../handlers/auth')
const UnAuthorizedError = require('../error/unauthorizedError')

jest.mock('../services/user');
jest.mock('../services/key');
jest.mock('../handlers/encryptor');
jest.mock('../handlers/email');
jest.mock('../services/emailToken')
jest.mock('../util/user');
jest.mock('../handlers/auth');

const REGISTER_REQ_BODY = {
  username: "username",
  email: "test@test.com",
  password: "password",
  mentalHealthStatus: "status",
  gender: "gender",
  age: 15
}
const ENCRYPTED_DATA_KEY = 'xxkeyxx'
const DATA_KEY = 'key'
const ENC_PASSWORD = "xxpasswordxx"
const TEST_USER_ID = '123'
const ENC_MENTAL_HEALTH_STATUS = 'xxstatus'
const ENC_GENDER = 'xxgenderxx'
const RESPONSE = { send: jest.fn() }
const ENC_TEST_USER = {
  _id: TEST_USER_ID,
  username: REGISTER_REQ_BODY.username,
  email: REGISTER_REQ_BODY.email,
  password: ENC_PASSWORD,
  mentalHealthStatus: ENC_MENTAL_HEALTH_STATUS,
  gender: ENC_GENDER,
  age: REGISTER_REQ_BODY.age,
  encryptedDataKey: ENCRYPTED_DATA_KEY
}
const DEC_TEST_USER = {
  _id: TEST_USER_ID,
  username: REGISTER_REQ_BODY.username,
  email: REGISTER_REQ_BODY.email,
  password: ENC_PASSWORD,
  mentalHealthStatus: REGISTER_REQ_BODY.mentalHealthStatus,
  gender: REGISTER_REQ_BODY.gender,
  age: REGISTER_REQ_BODY.age
}
const EMAIL_TOKEN = { token: 'emailToken' }
const AUTH_TOKEN = 'authToken'
const NEXT = () => {}

describe('register', () => {
  it('creates a user and sends an auth token', async () => {
    const req = {
      body: REGISTER_REQ_BODY,
      headers: {
        host: 'host'
      }
    }
    userService.getUserByUsername.mockResolvedValue(Promise.resolve(null))
    keyService.generateDataKey.mockResolvedValue(Promise.resolve(ENCRYPTED_DATA_KEY))
    keyService.decryptDataKey.mockResolvedValue(Promise.resolve(DATA_KEY))
    userUtil.getEncryptedUserValues = jest.fn().mockReturnValue([ ENC_GENDER, ENC_MENTAL_HEALTH_STATUS ]);
    userService.createUser.mockResolvedValue(Promise.resolve(ENC_TEST_USER))
    emailTokenService.createEmailToken.mockResolvedValue(Promise.resolve(EMAIL_TOKEN))
    encryptor.random = jest.fn().mockReturnValue(EMAIL_TOKEN.token)
    emailHandler.sendVerificationEmail.mockResolvedValue(Promise.resolve())
    authHandler.generateJWT = jest.fn().mockReturnValue(AUTH_TOKEN)

    await userRoute.register(req, RESPONSE, NEXT)
    expect(userService.getUserByUsername).toBeCalledWith(REGISTER_REQ_BODY.username);
    expect(keyService.decryptDataKey).toBeCalledWith(ENCRYPTED_DATA_KEY);
    expect(userUtil.getEncryptedUserValues).toBeCalledWith(DATA_KEY, REGISTER_REQ_BODY.mentalHealthStatus, REGISTER_REQ_BODY.gender)
    expect(userService.createUser).toBeCalledWith(
      REGISTER_REQ_BODY.username, 
      REGISTER_REQ_BODY.email,
      ENCRYPTED_DATA_KEY,
      REGISTER_REQ_BODY.password,
      ENC_MENTAL_HEALTH_STATUS,
      ENC_GENDER,
      REGISTER_REQ_BODY.age
    )
    expect(emailTokenService.createEmailToken).toBeCalledWith(ENC_TEST_USER._id, EMAIL_TOKEN.token)
    expect(emailHandler.sendVerificationEmail).toBeCalledWith(EMAIL_TOKEN.token, ENC_TEST_USER.email, req.headers.host)
    expect(authHandler.generateJWT).toBeCalledWith(ENC_TEST_USER._id)
    expect(RESPONSE.send).toHaveBeenCalledWith({ token: AUTH_TOKEN, isCreated: true});
  });

  it('does not create a user if the username already exists', async () => {
    const req = {  body: REGISTER_REQ_BODY }
    userService.getUserByUsername.mockResolvedValue(Promise.resolve({}))
    await userRoute.register(req, RESPONSE, NEXT)
    expect(RESPONSE.send).toHaveBeenCalledWith({ isCreated: false});
  });
});

describe('get current user', () => {
  it('gets the user object for the id', async () => {
    const req = { userId: TEST_USER_ID }
    userService.getUserById.mockResolvedValue(Promise.resolve(ENC_TEST_USER))
    keyService.decryptDataKey.mockResolvedValue(DATA_KEY)
    userUtil.decryptUser = jest.fn().mockReturnValue(DEC_TEST_USER)
    userUtil.convertModelToObject = jest.fn().mockReturnValue(DEC_TEST_USER)
    await userRoute.getCurrentUser(req, RESPONSE, NEXT)
    expect(userService.getUserById).toHaveBeenCalledWith(TEST_USER_ID);
    expect(keyService.decryptDataKey).toHaveBeenCalledWith(ENCRYPTED_DATA_KEY);
    expect(userUtil.decryptUser).toHaveBeenCalledWith(ENC_TEST_USER, DATA_KEY);
    expect(RESPONSE.send).toHaveBeenCalledWith(DEC_TEST_USER);
  })
})

describe('login', () => {
  const req = { 
    userId: TEST_USER_ID,
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
    expect(userUtil.getUserByUsernameOrEmail).toHaveBeenCalledWith(req.body.usernameOrEmail)
    expect(emailTokenService.getPasswordTokenByUserId).toHaveBeenCalledWith(ENC_TEST_USER._id)
    expect(encryptor.checkPassword).toHaveBeenCalledWith(req.body.password, ENC_TEST_USER.password)
    expect(authHandler.generateJWT).toBeCalledWith(ENC_TEST_USER._id)
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
    userUtil.getUserByUsernameOrEmail.mockResolvedValue(Promise.resolve(ENC_TEST_USER))
    emailTokenService.getPasswordTokenByUserId.mockResolvedValue(Promise.resolve(null))
    encryptor.checkPassword = jest.fn().mockReturnValue(false)
    expect.assertions(1);
    await userRoute.login(req, RESPONSE, NEXT).catch(err => {
      expect(err).toBeInstanceOf(UnAuthorizedError)
    })    
  })
})