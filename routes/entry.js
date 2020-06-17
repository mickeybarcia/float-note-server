const entryService = require('../services/entry');
const aiService = require('../services/ai');
const storageService = require('../services/storage');
const { getDate, getShortDate } = require('../utils/date')
const NotFoundError = require('../error/notFoundError')
const keyService = require('../services/key');
const encryptor = require('../handlers/encryptor')
const entryUtil = require('../utils/entry')
const userUtil = require('../utils/user')

/**
 * Gets a page of entries for a optional date range
 */
module.exports.getEntries = async (req, res, next) => {
    const resPerPage = 10; 
    const page = (req.query && req.query.page) || 1; 
    let entries;
    if (req.query.startDate && req.query.endDate) {
        const startDate = getShortDate(req.query.startDate);
        const endDate = getShortDate(req.query.endDate);
        entries = await entryService.getEntriesByUserIdAndDateRange(req.userId, startDate, endDate, resPerPage, page);
    } else {
        entries = await entryService.getEntriesByUserId(req.userId, resPerPage, page); 
    }
    if (entries.length > 0) {
        const dataKey = await userUtil.getDataKeyForUser(req.userId)
        entries = entries.map(entry => entryUtil.decryptEntry(entry, dataKey));
        entries = entries.map(entry => entryUtil.convertModelToObject(entry));
    }
    res.send({ entries: entries });
}

/**
 * Gets an entry by ID
 */
module.exports.getEntry = async (req, res, next) => {
    let entry = await entryService.getEntryById(req.params.entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    const dataKey = await userUtil.getDataKeyForUser(req.userId)
    entry = entryUtil.decryptEntry(entry, dataKey)
    entry = entryUtil.convertModelToObject(entry)
    res.send(entry);
}

/**
 * Adds and analyzes a text entry,
 * or uploads the metadata of an entry that needs images analyzed
 */
module.exports.addEntry = async (req, res, next) => {
    const date = getDate(req.body.date);
    const form = req.body.form;
    const encryptedDataKey = await userUtil.getEncryptedDataKeyForUser(req.userId)
    if (form == "text") {  // upload whole entry
        const [ dataKey, mlRes ] = await Promise.all([
            keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err }),
            aiService.analyzeEntry(req.body.text)
        ])
        const [ 
            encryptedText, 
            encryptedTitle, 
            encryptedScore, 
            encryptedKeywords 
        ] = entryUtil.getEncryptedEntryValues(req.body.text, req.body.title, mlRes.score, mlRes.keywords, dataKey)
        var entry = await entryService.saveEntry(
            req.userId, 
            encryptedTitle, 
            date, 
            encryptedText, 
            encryptedScore, 
            form, 
            encryptedKeywords
        );
        entry = entryUtil.convertEntryToPlaintext(entry, req.body.text, req.body.title, mlRes.score.toString(), mlRes.keywords) 
    } else {  // just upload metadata
        const dataKey = await keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err })
        var entry = await entryService.saveEntryMetadata(req.userId, encryptor.encryptAes(dataKey, req.body.title), date, form);
        entry.title = req.body.title
    }
    entry = entryUtil.convertModelToObject(entry)
    res.location('entries/' + entry._id);
    res.send(entry);  // TODO - make this not return the entry
}

module.exports.editEntry = async (req, res, next) => {
    const entryId = req.params.entryId;
    var entry = await entryService.getEntryById(entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    if (req.files != null) { // you are adding an image
        try { 
            entry = await entryUtil.handleEditEntryImagesRequest(req, entry)
        } catch (err) {
            // delete the meta data if image upload fails
            // await entryService.deleteEntryById(entryId);
            throw err;
        }
    } else { // you are editing the entry fields
        entry = await entryUtil.handleEditEntryRequest(req, entry)
    }
    res.location('entries/' + entry._id);  
    entry = entryUtil.convertModelToObject(entry)                      
    res.send(entry);
}

/**
 * Get an image for an entry
 */
module.exports.getEntryImage = async (req, res, next) => {
    const imageUrl = req.params.location
    const entry = await entryService.getEntryById(req.params.entryId)
    if (entry.imageUrls.includes(imageUrl)) {
        const encryptedDataKey = await userUtil.getEncryptedDataKeyForUser(req.userId)
        const [ dataKey, encBuffer ] = await Promise.all([
            keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err }),
            storageService.getImage(imageUrl).catch(err => {
                if (err.code == 404) {
                    throw new NotFoundError('Image not found')
                }
                throw err;
            })
        ])
        const decBuffer = encryptor.decryptAesBuffer(dataKey, encBuffer)
        res.type('png');
        res.end(decBuffer);
    } else {
        throw new Error('Image does not exist for this user');
    }
}

module.exports.deleteEntry =  async (req, res, next) => {
    const entryId = req.params.entryId;
    var entry = await entryService.getEntryById(entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    if (entry.imageUrls != null && entry.imageUrls.length !== 0) {
        entry.imageUrls.forEach(storageService.deleteImage(url)); 
    }
    await entryService.deleteEntryById(entryId);
    res.sendStatus(202);
}

module.exports.getImageText = async (req, res, next) => {
    const text = await aiService.getImageText(req.file);
    res.send(text);
}