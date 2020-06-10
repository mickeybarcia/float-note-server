const userService = require('../services/user');
const { encryptAes, decryptAes, encryptAesBuffer } = require('../handlers/encryptor') 

function convertModelToObject(model) { 
    return model.toObject({ getters: true })
}

async function getEncryptedDataKey(userId) {
    const user = await userService.getUserById(userId)
    return user.encryptedDataKey
}

async function getDataKey(userId) {
    const encryptedDataKey = await getEncryptedDataKey(userId)
    const dataKey = await keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err })
    return dataKey
}

function convertEntryToPlaintext(entry, text, title, score, keywords) {
    entry.text = text
    entry.title = title
    entry.score = score
    entry.keywords = keywords
    return entry
}

function decryptEntry(entry, dataKey) {
    entry.text = decryptAes(dataKey, entry.text)
    entry.title = decryptAes(dataKey, entry.title)
    entry.score = decryptAes(dataKey, entry.score)
    entry.keywords = entry.keywords.map(word => decryptAes(dataKey, word))
    return entry
}
  
function getEncryptedEntryValues(text, title, score, keywords, dataKey) {
    const encryptedKeywords = keywords.map(word => encryptAes(dataKey, word))
    return [ 
        encryptAes(dataKey, text),  
        title ? encryptAes(dataKey, title) : null,
        encryptAes(dataKey, score.toString()),
        encryptedKeywords
    ];
}

function getEncryptedUserValues(dataKey, mentalHealthStatus, gender) {
    return [
        gender ? encryptAes(dataKey, gender) : null,
        mentalHealthStatus ? encryptAes(dataKey, mentalHealthStatus) : null
    ]
}

function decryptUser(user, dataKey) {
    if (user.gender) {
        user.gender = decryptAes(dataKey, user.gender)
    }
    if (user.mentalHealthStatus) {
        user.mentalHealthStatus = decryptAes(dataKey, user.mentalHealthStatus)
    }
    return user
}

function encryptImages(images, dataKey) {
    images = images.map(image => {
        image.buffer = encryptAesBuffer(dataKey, image.buffer)
        return image
    })
    return images
}

module.exports = { 
    convertModelToObject, 
    getEncryptedDataKey, 
    convertEntryToPlaintext,
    decryptEntry,
    getEncryptedEntryValues,
    getEncryptedUserValues,
    decryptUser,
    encryptImages,
    getDataKey
}