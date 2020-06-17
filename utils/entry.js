const encryptor = require('../handlers/encryptor')
const keyService = require('../services/key')
const entryService = require('../services/entry')
const { getDate } = require('../utils/date')
const aiService = require('../services/ai')
const storageService = require('../services/storage')
const userUtil = require('../utils/user')

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

module.exports.handleEditEntryImagesRequest = async (req, entry) => {
    let images = req.files;
    const encryptedDataKey = await userUtil.getEncryptedDataKeyForUser(req.userId)
    const [ dataKey, mlRes ] = await Promise.all([
        keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err }),
        aiService.analyzeEntryFromImages(images)
    ])
    const [ 
        encryptedText, 
        encryptedTitle, 
        encryptedScore, 
        encryptedKeywords 
    ] = module.exports.getEncryptedEntryValues(mlRes.text, null, mlRes.score, mlRes.keywords, dataKey)
    images = images.map(image => {
        image.url = Date.now() + image.originalname
        return image
    })
    entry = await entryService.editEntry(
        entry._id, 
        { 
            text: encryptedText,
            score: encryptedScore, 
            keywords: encryptedKeywords, 
            imageUrls: images.map(image => image.url)
        }
    );            
    entry = module.exports.convertEntryToPlaintext(entry, req.body.text, encryptor.decryptAes(dataKey, entry.title), mlRes.score.toString(), mlRes.keywords) 
    encryptedImages = module.exports.encryptImages(images, dataKey)
    await storageService.saveImages(encryptedImages).catch(err => { throw err });  // TODO parrallelize saving entry
    return entry
}

module.exports.handleEditEntryRequest = async (req, entry) => {
    // TODO edit only sent fields
    let reqText = req.body.text;
    let reqTitle = req.body.title;
    let reqDate = getDate(req.body.date)
    const encryptedDataKey = await userUtil.getEncryptedDataKeyForUser(req.userId)
    const dataKey = await keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err })
    const currentEntry = await module.exports.decryptEntry(entry, dataKey)
    if (currentEntry.text != reqText) {  // you edited the text
        const mlRes = await aiService.analyzeEntry(reqText)
        const [ 
            encryptedText, 
            encryptedTitle, 
            encryptedScore, 
            encryptedKeywords 
        ] = module.exports.getEncryptedEntryValues(reqText, reqTitle, mlRes.score, mlRes.keywords, dataKey)
        entry = await entryService.editEntry(
            entry._id, 
            { 
                text: encryptedText,
                score: encryptedScore, 
                title: encryptedTitle,
                keywords: encryptedKeywords,
                date: reqDate
            }
        );   
        entry = module.exports.convertEntryToPlaintext(entry, reqText, reqTitle, mlRes.score.toString(), mlRes.keywords)
        return entry  
    } else if (reqTitle != currentEntry.title) {  // you just edited the title
        await entryService.editEntry(entry._id, { title: encryptor.encryptAes(dataKey, reqTitle), date: reqDate });   
        entry = module.exports.convertEntryToPlaintext(entry, reqText, reqTitle, currentEntry.score, currentEntry.keywords)
        return entry 
    } else if (reqDate != currentEntry.date) { // you edited something else
        entry = await entryService.editEntry(entry._id, { date: reqDate });   
        currentEntry.date = entry.date
        return currentEntry
    }
    return currentEntry 
}