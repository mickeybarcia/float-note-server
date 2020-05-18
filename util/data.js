const userService = require('../services/user');
const { encryptAES, decryptAES } = require('../handlers/encryptor')

// filled with some temp encryption functions pending mongodb encryption

function convertModelToObject(model) { 
    return model.toObject({ getters: true })
}

async function getEncryptedDataKey(userId) {
    const user = await userService.getUserById(userId)
    return user.encryptedDataKey
}

function convertEntryToPlaintext(entry, text, title, score, keywords) {
    entry.text = text
    entry.title = title
    entry.score = score
    entry.keywords = keywords
    return entry
}

function decryptEntry(entry, dataKey) {
    entry.text = decryptAES(dataKey, entry.text)
    entry.title = decryptAES(dataKey, entry.title)
    entry.score = decryptAES(dataKey, entry.score)
    entry.keywords = entry.keywords.map(word => decryptAES(dataKey, word))
    return entry
}
  
function getEncryptedEntryValues(text, title, score, keywords, dataKey) {
    const encryptedKeywords = keywords.map(word => encryptAES(dataKey, word))
    return [ 
        encryptAES(dataKey, text),  
        title ? encryptAES(dataKey, title) : null,
        encryptAES(dataKey, score.toString()),
        encryptedKeywords
    ];
}

function getEncryptedUserValues(dataKey, mentalHealthStatus, gender) {
    return [
        gender ? encryptAES(dataKey, gender) : null,
        mentalHealthStatus ? encryptAES(dataKey, mentalHealthStatus) : null
    ]
}

function decryptUser(user, dataKey) {
    if (user.gender) {
        user.gender = decryptAES(dataKey, user.gender)
    }
    if (user.mentalHealthStatus) {
        user.mentalHealthStatus = decryptAES(dataKey, user.mentalHealthStatus)
    }
    return user
}

module.exports = { 
    convertModelToObject, 
    getEncryptedDataKey, 
    convertEntryToPlaintext,
    decryptEntry,
    getEncryptedEntryValues,
    getEncryptedUserValues,
    decryptUser
}