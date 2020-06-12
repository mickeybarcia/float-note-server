const { isEmail } = require('../util/email')
const encryptor = require('../handlers/encryptor')
const userService = require('../services/user')

module.exports.getUserByUsernameOrEmail = async (usernameOrEmail) => {
    if (!isEmail(usernameOrEmail)) {
        return userService.getUserByUsername(usernameOrEmail);
    } else {
        return userService.getUserByEmail(usernameOrEmail);
    }
}

module.exports.getEncryptedUserValues = (dataKey, mentalHealthStatus, gender) => {
    return [
        gender ? encryptor.encryptAes(dataKey, gender) : null,
        mentalHealthStatus ? encryptor.encryptAes(dataKey, mentalHealthStatus) : null
    ]
}

module.exports.decryptUser = (user, dataKey) => {
    if (user.gender) {
        user.gender = encryptor.decryptAes(dataKey, user.gender)
    }
    if (user.mentalHealthStatus) {
        user.mentalHealthStatus = encryptor.decryptAes(dataKey, user.mentalHealthStatus)
    }
    return user
}

module.exports.convertModelToObject = (model) => {
    return model.toObject({ getters: true })
}