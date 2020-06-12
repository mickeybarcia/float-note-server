const encryptor = require('../handlers/encryptor')

module.exports.convertEntryToPlaintext = (entry, text, title, score, keywords) => {
    entry.text = text
    entry.title = title
    entry.score = score
    entry.keywords = keywords
    return entry
}

module.exports.decryptEntry = (entry, dataKey) => {
    entry.text = encryptor.decryptAes(dataKey, entry.text)
    entry.title = encryptor.decryptAes(dataKey, entry.title)
    entry.score = encryptor.decryptAes(dataKey, entry.score)
    entry.keywords = entry.keywords.map(word => encryptor.decryptAes(dataKey, word))
    return entry
}
  
module.exports.getEncryptedEntryValues = (text, title, score, keywords, dataKey) => {
    const encryptedKeywords = keywords.map(word => encryptor.encryptAes(dataKey, word))
    return [ 
        encryptor.encryptAes(dataKey, text),  
        title ? encryptor.encryptAes(dataKey, title) : null,
        encryptor.encryptAes(dataKey, score.toString()),
        encryptedKeywords
    ];
}

module.exports.encryptImages = (images, dataKey) => {
    images = images.map(image => {
        image.buffer = encryptor.encryptAesBuffer(dataKey, image.buffer)
        return image
    })
    return images
}

module.exports.convertModelToObject = (model) => {
    return model.toObject({ getters: true })
}