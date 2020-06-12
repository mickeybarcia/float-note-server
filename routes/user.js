/**
 * The endpoints for authenticating, accessing, and modifying users 
 */

const path = require("path")
const UnAuthorizedError = require('../error/unauthorizedError')
const NotFoundError = require('../error/notFoundError')
const BadRequestError = require('../error/badRequestError')
const emailHandler = require('../handlers/email')
const authHandler = require('../handlers/auth')
const encryptor = require('../handlers/encryptor')
const emailTokenService = require('../services/emailToken')
const keyService = require('../services/key') 
const userService = require('../services/user')
const userUtil = require('../util/user')

/**
 * Get the user object for the authenticated user
 */
module.exports.getCurrentUser = async (req, res, next) => {
    let user = await userService.getUserById(req.userId);
    if (!user) {
        throw new BadRequestError('User not found');
    }
    const dataKey = await keyService.decryptDataKey(user.encryptedDataKey).catch(err => { throw err })
    user = userUtil.decryptUser(user, dataKey)
    user = userUtil.convertModelToObject(user)
    res.send(user);
}

/**
 * Login if the username or email exists,
 * the password or password token is correct,
 * and return an auth token
 */
module.exports.login = async (req, res, next) => {
    const user = await userUtil.getUserByUsernameOrEmail(req.body.usernameOrEmail);
    if (!user) {
        throw new UnAuthorizedError('Username or email not correct');
    }
    // if there is a token, compare against that instead
    const token = await emailTokenService.getPasswordTokenByUserId(user._id);
    if (token && encryptor.checkPassword(req.body.password, token.token)) {
        res.send({ validReset: true });
    } else if (!token && encryptor.checkPassword(req.body.password, user.password)) {
        res.send({ token: authHandler.generateJWT(user._id) });
    } else {
        throw new UnAuthorizedError('Password not correct');
    }
}

/**
 * Create a user if the username is unique, 
 * send a verification email,
 * and return an auth token
 */
module.exports.register = async (req, res, next) => {
    const user = await userService.getUserByUsername(req.body.username);
    // TODO - check email uniqueness
    if (!user) {
        const encryptedDataKey = await keyService.generateDataKey().catch(err => { throw err })
        const dataKey = await keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err })
        const [ 
            encryptedGender, encryptedMentalHealthStatus 
        ] = userUtil.getEncryptedUserValues(dataKey, req.body.mentalHealthStatus, req.body.gender)
        const user = await userService.createUser(
            req.body.username,
            req.body.email,
            encryptedDataKey,
            req.body.password,
            encryptedMentalHealthStatus,
            encryptedGender,
            req.body.age
        )
        var emailToken = await emailTokenService.createEmailToken(user._id, encryptor.random())
        await emailHandler.sendVerificationEmail(emailToken.token, user.email, req.headers.host);
        res.send({ 
            token: authHandler.generateJWT(user._id), 
            isCreated: true 
        });
    } else { // the username is not unique, but don't send that info back directly
        res.send({ isCreated: false });
    }
}

module.exports.updateProfile = async (req, res, next) => {
    const dataKey = await keyService.getDataKey(req.userId)
    const [ 
        encryptedGender, encryptedMentalHealthStatus 
    ] = userUtil.getEncryptedUserValues(dataKey, req.body.mentalHealthStatus, req.body.gender)
    let newData = {}
    if (encryptedGender) {
        newData.gender = encryptedGender
    }
    if (encryptedMentalHealthStatus) {
        newData.mentalHealthStatus = encryptedMentalHealthStatus
    }
    let user = await userService.updateProfile(req.userId, newData);
    user = userUtil.decryptUser(user, dataKey)
    user = userUtil.convertModelToObject(user)
    res.send(user);
}

module.exports.updateUsername = async (req, res, next) => {
    const user = await userService.getUserByUsername(req.body.username);
    if (!user) {
        await userService.updateUsername(req.userId, req.body.username);
        res.send({ isUpdated: true });
    } else {
        res.send({ isUpdated: false });
    }
}

module.exports.validateUsername = async (req, res, next) => {
    const user = await userService.getUserByUsername(req.body.username);
    if (!user) {
        res.send({ isUnique: true });
    } else {
        res.send({ isUnique: false });
    }
}

module.exports.deleteAccount = async (req, res, next) => {
    await userService.deleteUserById(req.userId);
    res.sendStatus(202);
}

module.exports.updateEmail = async (req, res, next) => {
    await emailTokenService.deleteEmailTokenByUserId(req.userId)  // remove any previous ones in case
    const emailToken = await emailTokenService.createEmailToken(req.userId, encryptor.random())
    await Promise.all([
        userService.updateEmail(req.userId, req.body.email), 
        emailHandler.sendVerificationEmail(emailToken.token, req.body.email, req.headers.host)
    ]);
    res.sendStatus(200);
}

module.exports.forgotPassword = async (req, res, next) => {
    const user = await userUtil.getUserByUsernameOrEmail(req.body.usernameOrEmail);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    await emailTokenService.deletePasswordTokenByUserId(user._id)  // remove any previous ones in case
    const token = encryptor.random()
    await Promise.all([
        emailTokenService.createPasswordToken(user._id, token),
        emailHandler.sendForgotPasswordEmail(token, user.email, req.headers.host)
    ]);
    res.sendStatus(200);
}

module.exports.updatePassword = async (req, res, next) => {
    if (req.body.oldPassword == req.body.newPassword) {
        throw new BadRequestError('Password must be different');
    }
    const user = await userUtil.getUserByUsernameOrEmail(req.body.usernameOrEmail);
    if (!user) {
        throw new UnAuthorizedError('Username not correct');
    }
    // if there is a token, compare against that instead
    const token = await emailTokenService.getPasswordTokenByUserId(user._id);
    if (token && encryptor.checkPassword(req.body.oldPassword, token.token)) {  
        emailTokenService.deletePasswordTokenByUserId(user._id);
        await userService.updatePassword(user._id, req.body.newPassword)
    } else if (!token && encryptor.checkPassword(req.body.oldPassword, user.password)) {
        await userService.updatePassword(user._id, req.body.newPassword)
    } else {
        throw new UnAuthorizedError('Old password not correct');
    }
    res.sendStatus(200)   
 }

module.exports.verifyEmail = async (req, res, next) => {
    const token = await emailTokenService.getEmailToken(req.params.token)
    if (!token) {
        throw new BadRequestError('Token invalid or expired');
    }
    const user = await userService.getUserById(token.userId); 
    if (!user) {
        throw new NotFoundError('Account verified already');
    }
    if (user.isVerified) {
        throw new BadRequestError('Account verified already');
    }
    await userService.verify(user); 
    res.sendFile(path.join(__dirname, '../views/verifyAccountSuccess.html'));
}

module.exports.sendVerification = async (req, res, next) => {
    await emailTokenService.deleteEmailTokenByUserId(req.userId)
    const emailToken = await emailTokenService.createEmailToken(req.userId, encryptor.random())
    await emailHandler.sendVerificationEmail(emailToken.token, req.body.email, req.headers.host);
    res.sendStatus(200)
}