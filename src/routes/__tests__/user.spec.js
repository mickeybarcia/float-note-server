jest.mock('../../services/user');
jest.mock('../../handlers/encryptor');
jest.mock('../../handlers/email');
jest.mock('../../services/emailToken')
jest.mock('../../handlers/auth');

const userRoute = require('../user')
const userService = require('../../services/user')
const emailTokenService = require('../../services/emailToken') 
const { checkPassword } = require('../../handlers/encryptor')
const { generateJWT } = require('../../handlers/auth')
const emailHandler = require('../../handlers/email')
const UnAuthorizedError = require('../../error/unauthorizedError')
const {
  USER_ID,
  USER,
  USERNAME,
  EMAIL,
  PASSWORD,
  MENTAL_HEALTH_STATUS,
  GENDER,
  AGE,
  REGISTER_REQ_BODY,
  EMAIL_TOKEN_VALUE,
  EMAIL_TOKEN,
  AUTH_TOKEN,
  HOST
} = require('../../__tests__/userConstants')

const RESPONSE = { send: jest.fn() }
let NEXT = () => {}

describe('register', () => {
  const req = {
    body: REGISTER_REQ_BODY,
    headers: {
      host: HOST
    }
  } 
  it('creates a user and sends an auth token', async () => {
    userService.getUserByUsername.mockResolvedValue(Promise.resolve(null))
    userService.createUser.mockResolvedValue(Promise.resolve(USER))
    emailTokenService.createEmailToken.mockResolvedValue(Promise.resolve(EMAIL_TOKEN))
    emailHandler.sendVerificationEmail.mockResolvedValue(Promise.resolve())
    generateJWT.mockReturnValue(AUTH_TOKEN)
    await userRoute.register(req, RESPONSE, NEXT)
    expect(userService.getUserByUsername).toBeCalledWith(USERNAME);
    expect(userService.createUser).toBeCalledWith(
      USERNAME, 
      EMAIL,
      PASSWORD,
      MENTAL_HEALTH_STATUS,
      GENDER,
      AGE
    )
    expect(emailHandler.sendVerificationEmail).toBeCalledWith(EMAIL_TOKEN_VALUE, EMAIL, HOST)
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
    userService.getUserById.mockResolvedValue(Promise.resolve(USER))
    await userRoute.getCurrentUser(req, RESPONSE, NEXT)
    expect(userService.getUserById).toHaveBeenCalledWith(USER_ID);
    expect(RESPONSE.send).toHaveBeenCalledWith(USER.toObject());
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
    userService.getUserByUsername.mockResolvedValue(Promise.resolve(USER))
    checkPassword.mockReturnValueOnce(true)
    generateJWT.mockReturnValue(AUTH_TOKEN)
    await userRoute.login(req, RESPONSE, NEXT)
    expect(userService.getUserByUsername).toHaveBeenCalledWith(USERNAME)
    expect(checkPassword).toHaveBeenCalledWith(PASSWORD, USER.password)
    expect(RESPONSE.send).toHaveBeenCalledWith({ token: AUTH_TOKEN });
  })
  it('fails if the username or email does not exist', async () => {
    expect.assertions(1);
    userService.getUserByUsername = jest.fn().mockReturnValue(null)
    await userRoute.login(req, RESPONSE, NEXT).catch(err => {
      expect(err).toBeInstanceOf(UnAuthorizedError)
    })
  })
  it('fails if the user password is incorrect', async () => {
    expect.assertions(1);
    userService.getUserByUsername.mockResolvedValue(Promise.resolve(USER))
    checkPassword.mockReturnValueOnce(false)
    await userRoute.login(req, RESPONSE, NEXT).catch(err => {
      expect(err).toBeInstanceOf(UnAuthorizedError)
    })    
  })
})