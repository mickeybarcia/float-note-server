/**
 * The endpoints for authenticating, accessing, and modifying users 
 */

const path = require("path")
const UnAuthorizedError = require('../error/unauthorizedError')
const NotFoundError = require('../error/notFoundError')
const BadRequestError = require('../error/badRequestError')
const { logError } = require('../handlers/error')
const emailHandler = require('../handlers/email')
const { generateJWT } = require('../handlers/auth')
const { checkPassword } = require('../handlers/encryptor')
const emailTokenService = require('../services/emailToken')
const userService = require('../services/user')
const { isEmail } = require('../utils/email')

/**
 * Get the user object for the authenticated user
 */
module.exports.getCurrentUser = async (req, res, next) => {
    let user = await userService.getUserById(req.userId);
    if (!user) throw new BadRequestError('User not found');
    res.send(user.toObject());
}

/**
 * Login if the username or email exists,
 * the password or password token is correct,
 * and return an auth token
 */
module.exports.login = async (req, res, next) => {
    const user = await getUserByUsernameOrEmail(req.body.usernameOrEmail);
    if (!user) throw new UnAuthorizedError('Username or email not correct');
    if (checkPassword(req.body.password, user.password)) {
        res.send({ token: generateJWT(user._id) });
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
    const isUnique = await isUsernameUnique(req.body.username)  // TODO - check email uniqueness
    if (isUnique) {
        const user = await userService.createUser(
            req.body.username,
            req.body.email,
            req.body.password,
            req.body.mentalHealthStatus,
            req.body.gender,
            req.body.age.toString()
        )
        const emailToken = await emailTokenService.createEmailToken(user._id)
        await emailHandler.sendVerificationEmail(emailToken.token, user.email, req.headers.host);
        res.send({ 
            token: generateJWT(user._id), 
            isCreated: true 
        });
    } else {  // the username is not unique, but don't send that info back directly
        res.send({ isCreated: false });
    }
}

/**
 * Returns user after determining whether to search by username or email
 * 
 * @param {string} usernameOrEmail 
 */
async function getUserByUsernameOrEmail(usernameOrEmail) {
    if (!isEmail(usernameOrEmail)) {
        return userService.getUserByUsername(usernameOrEmail);
    } else {
        return userService.getUserByEmail(usernameOrEmail);
    }
}

/**
 * Updates user profile info such as gender, mental health status
 */
module.exports.updateProfile = async (req, res, next) => {
    var user = await userService.getUserById(req.userId)
    if (!user) throw new BadRequestError('User not found');
    user = await userService.updateProfile(user, req.body);
    res.send(user.toObject());
}

/**
 * Updates the username if it is unique
 */
module.exports.updateUsername = async (req, res, next) => {
    const isUnique = await isUsernameUnique(req.body.username)
    if (isUnique) {
        const user = await userService.updateUsername(req.userId, req.body.username);
        res.send({ isUpdated: user != null });
    } else {
        res.send({ isUpdated: false });
    }
}

/**
 * Checks if username already exists
 * 
 * @param {string} username 
 */
async function isUsernameUnique(username) {
    const user = await userService.getUserByUsername(username);
    return user == null
}

/**
 * Checks to see if username is taken
 */
module.exports.checkUsername = async (req, res, next) => {
    const isUnique = await isUsernameUnique(req.body.username)
    res.send({ isUnique });
}

/**
 * Deletes user from database
 */
module.exports.deleteAccount = async (req, res, next) => {
    await userService.deleteUserById(req.userId);
    res.sendStatus(202);
}

/**
 * Updates the email and then sends another verification email
 */
module.exports.updateEmail = async (req, res, next) => {
    await emailTokenService.deleteEmailTokenByUserId(req.userId)  // remove any previous ones in case
    const emailToken = await emailTokenService.createEmailToken(req.userId)
    const user = await userService.updateEmail(req.userId, req.body.email)
    if (user) await emailHandler.sendVerificationEmail(emailToken.token, req.body.email, req.headers.host)
    res.sendStatus(200);
}

/**
 * Checks if the user exists and then sends an email to reset the password
 */
module.exports.sendForgotPassword = async (req, res, next) => {
    const user = await getUserByUsernameOrEmail(req.body.usernameOrEmail);
    if (!user) throw new NotFoundError('User not found');
    await emailTokenService.deletePasswordTokenByUserId(user._id)  // remove any previous ones in case
    const passwordToken = await emailTokenService.createPasswordToken(user._id)
    await emailHandler.sendForgotPasswordEmail(passwordToken.token, user.email, req.headers.host)
    res.sendStatus(200);
}

/**
 * Updates a user's password
 */
module.exports.updatePassword = async (req, res, next) => {
    const user = await userService.getUserById(req.userId, false)
    if (checkPassword(req.body.oldPassword, user.password)) {
        await userService.updatePassword(user, req.body.newPassword)
        res.sendStatus(200)
    } else {
        throw new UnAuthorizedError('Old password not correct');
    }
 }

 /**
  * Verfies user can access their email
  */
module.exports.verifyEmail = async (req, res, next) => {
    const token = await emailTokenService.getEmailToken(req.params.token)
    if (!token) throw new BadRequestError('Token invalid or expired');
    const user = await userService.getUserById(token.userId, false); 
    if (!user) throw new NotFoundError('User not found'); 
    if (user.isVerified) throw new BadRequestError('Account verified already');
    await userService.verify(user);
    res.sendFile(path.join(__dirname, '../views/verifyAccountSuccess.html'));
}

/**
 * Renders page to create new password for users who forgot theirs
 */
module.exports.renderResetPassword = async (req, res, next) => {
    const token = await emailTokenService.getPasswordToken(req.params.token)
    if (token) {
        res.render('reset')
    } else {
        throw new NotFoundError("A password reset is not active")
    }
}

/**
 * Resets password change submitted from form
 */
module.exports.resetPassword = async (req, res, next) => {
    try {
        const token = await emailTokenService.getPasswordToken(req.params.token)
        if (!token) throw new BadRequestError('Token invalid or expired');
        const user = await userService.getUserById(token.userId); 
        if (!user) throw new NotFoundError('User not found'); 
        await userService.updatePassword(user, req.body.password)
    } catch (err) {  // TODO - apply to front end methods
        logError(err, req) 
        res.render('error', { error: 'Unable to update password. Token may be invalid or expired...' })
    }
    emailTokenService.deletePasswordTokenByUserId(user._id) 
    emailHandler.sendPasswordChangeEmail(user.email)
    res.render('mobile')
}

/**
 * Sends an email verification email
 */
module.exports.sendVerification = async (req, res, next) => {
    const userId = req.userId
    await emailTokenService.deleteEmailTokenByUserId(userId)  
    const [ emailToken, user] = await Promise.all([
        await emailTokenService.createEmailToken(req.userId),
        await userService.getUserById(userId, false)
    ]) 
    await emailHandler.sendVerificationEmail(emailToken.token, user.email, req.headers.host);
    res.sendStatus(200)
}