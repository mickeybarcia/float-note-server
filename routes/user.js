const userService = require('../services/user')
const UnAuthorizedError = require('../error/unauthorizedError')
const NotFoundError = require('../error/notFoundError')
const BadRequestError = require('../error/badRequestError')
const emailHandler = require('../handlers/email')
const { generateToken } = require('../handlers/auth')
const encryptor = require('../handlers/encryptor')
const { isEmail } = require('../util/email')
const emailTokenService = require('../services/emailToken')

function convertModelToObject(user) {
    return user.toObject({ getters: true })
}

module.exports.getCurrentUser = async (req, res, next) => {
    const user = await userService.getUserById(req.userId);
    if (!user) {
        throw new BadRequestError('User not found');
    }
    res.send(convertModelToObject(user));
}

function getUserByUsernameOrEmail(usernameOrEmail) {
    if (!isEmail(usernameOrEmail)) {
        return userService.getUserByUsername(usernameOrEmail);
    } else {
        return userService.getUserByEmail(usernameOrEmail);
    }
}

module.exports.login = async (req, res, next) => {
    const user = await getUserByUsernameOrEmail(req.body.usernameOrEmail);
    if (!user) {
        throw new UnAuthorizedError('Username or email not correct');
    }
    const token = await emailTokenService.getPasswordTokenByUserId(user._id);
    if (token && encryptor.checkPassword(req.body.password, token.token)) {  // if there is a token, compare against that instead
        res.send({ validReset: true });
    } else if (!token && encryptor.checkPassword(req.body.password, user.password)) {
        res.send({ token: generateToken(user._id) });
    } else {
        throw new UnAuthorizedError('Password not correct');
    }
}

module.exports.register = async (req, res, next) => {
    const user = await userService.getUserByUsername(req.body.username);
    if (!user) {
        const user = await userService.createUser(req.body)
        var emailToken = await emailTokenService.createEmailToken(userId)
        await emailHandler.sendVerificationEmail(emailToken.token, user.email, req.headers.host);
        res.send({ token: generateToken(user._id), isCreated: true });
    } else {
        res.send({ isCreated: false });
    }
}

module.exports.updateProfile = async (req, res, next) => {
    const user = await userService.updateProfile(req.userId, req.body);
    res.send(convertModelToObject(user));
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
    await userService.updateEmail(req.userId, req.body.email)
    await emailHandler.sendVerificationEmail(emailToken.token, req.body.email, req.headers.host);
    res.sendStatus(200);
}

module.exports.forgotPassword = async (req, res, next) => {
    const user = await getUserByUsernameOrEmail(req.body.usernameOrEmail);
    if (!user) {
        throw new NotFoundError('User not found');
    }
    await emailTokenService.deletePasswordTokenByUserId(user._id)  // remove any previous ones in case
    const token = encryptor.random()
    await emailTokenService.createPasswordToken(user._id, token)
    await emailHandler.sendForgotPasswordEmail(token, user.email, req.headers.host)
    res.sendStatus(200);
}

module.exports.updatePassword = async (req, res, next) => {
    if (req.body.oldPassword == req.body.newPassword) {
        throw new BadRequestError('Password must be different');
    }
    const user = await getUserByUsernameOrEmail(req.body.usernameOrEmail);
    if (!user) {
        throw new UnAuthorizedError('Username not correct');
    }
    const token = await emailTokenService.getPasswordTokenByUserId(user._id);
    if (token && encryptor.checkPassword(req.body.oldPassword, token.token)) {  // if there is a token, compare against that instead
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
    res.sendStatus(200)
}

module.exports.sendVerification = async (req, res, next) => {
    await emailTokenService.deleteEmailTokenByUserId(req.userId)
    const emailToken = await emailTokenService.createEmailToken(req.userId, encryptor.random())
    await emailHandler.sendVerificationEmail(emailToken.token, req.body.email, req.headers.host);
    res.sendStatus(200)
}
