const entryService = require('../services/entry');
const userService = require('../services/user');
const aiService = require('../services/ai');
const storageService = require('../services/storage');
const { getDate, getShortDate } = require('../util/date')
const NotFoundError = require('../error/notFoundError')
const { encryptDiary, decryptDiary, decryptDataKey } = require('../handlers/encryptor')

function convertModelToObject(entry) {
    return entry.toObject({ getters: true })
}

const decryptEntryPromise = async (entry, dataKey) => { 
    entry.text = await decryptDiary(entry.text, dataKey)
    return entry
}

const decryptEntry = async (entry, dataKey) => {
  return decryptEntryPromise(entry, dataKey)
}

module.exports.getEntries = async (req, res, next) => {
    const resPerPage = 10; 
    const page = req.params.page || 1; 
    if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(getShortDate(req.query.startDate));
        const endDate = new Date(getShortDate(req.query.endDate));
        entries = await entryService.getEntriesByUserIdAndDateRange(req.userId, startDate, endDate, resPerPage, page);
    } else {
        entries = await entryService.getEntriesByUserId(req.userId, resPerPage, page); 
    }
    entries = entries.map(entry => convertModelToObject(entry));
    // decrypt the entries
    const user = await userService.getUserById(req.userId)
    const dataKey = await decryptDataKey(user.encryptedDataKey).catch(err => { throw err })
    entries = await Promise.all(entries.map(entry => decryptEntry(entry, dataKey)))
    res.send({ entries: entries });
}

module.exports.getEntry = async (req, res, next) => {
    const entry = await entryService.getEntryById(req.params.entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    entry = convertModelToObject(entry)
    res.send(entry);
}

module.exports.addEntry = async (req, res, next) => {
    const date = getDate(req.body.date);
    const form = req.body.form;
    if (form == "text") {  // upload whole entry
        // encrypt the entry (and analyze text at same time)
        const user = await userService.getUserById(req.userId)
        const dataKey = await decryptDataKey(user.encryptedDataKey).catch(err => { throw err })
        const [encryptedText, mlRes] = await Promise.all([
            encryptDiary(req.body.text, dataKey),
            aiService.analyzeEntry(form, req.body.text)
        ])
        var entry = await entryService.saveEntry(req.userId, req.body.title, date, encryptedText, mlRes.score, form, mlRes.keywords);
        entry.text = req.body.text
    } else {  // just upload metadata
        var entry = await entryService.saveEntryMetadata(req.userId, req.body.title, date, form);
    }
    entry = convertModelToObject(entry)
    res.location('entries/' + entry._id);
    res.send(entry);
}

module.exports.editEntry = async (req, res, next) => {
    const entryId = req.params.entryId;
    var entry = await entryService.getEntryById(entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    if (req.files != null) { // you are adding an image
        try {
            const images = req.files;
            await storageService.saveImages(images).catch(err => { throw err });
            const [mlRes, user] = await Promise.all([
                aiService.analyzeEntryFromImages(images),
                userService.getUserById(req.userId)
            ])
            const dataKey = await decryptDataKey(user.encryptedDataKey).catch(err => { throw err })
            const currentText = await encryptDiary(mlRes.text, dataKey)
            entry = await entryService.saveEntryAnalytics(entry, currentText, mlRes.score, mlRes.keywords, images);
            entry.text = mlRes.text  // send back the plaintext
        } catch(err) {  // delete the meta data if image upload fails
            //await entryService.deleteEntryById(entryId);
            throw err;
        }
    } else { // you are editing the entry fields
        reqForm = req.body.form;
        reqText = req.body.text;
        date = getDate(req.body.date);
        // decrypt current text to see if we need to analyze and encrypt
        const user = await userService.getUserById(req.userId)
        const dataKey = await decryptDataKey(user.encryptedDataKey).catch(err => { throw err })
        const currentText = await decryptDiary(entry.text, dataKey)
        if (currentText != null && currentText != reqText) { // you edited the text
            const [encryptedText, mlRes] = await Promise.all([
                encryptDiary(req.body.text, dataKey),
                aiService.analyzeEntry(reqForm, req.body.text)
            ])
            entry = await entryService.editEntry(entry, req.body.title, date, encryptedText, mlRes.score, reqForm, mlRes.keywords);
            entry.text = reqText  // send back the plaintext
        } else { // you edited something else
            entry = await entryService.editEntry(entry, req.body.title, date, entry.text, entry.score, reqForm, entry.keywords);
        }
    }
    entry = convertModelToObject(entry)
    res.location('entries/' + entry._id);                        
    res.send(entry);
}

module.exports.getEntryImage = async (req, res, next) => {  // TODO - check for permission to view image
    const file = await storageService.getImage(req.params.location).catch(err => {
        if (err.code == 404) {
            throw new NotFoundError('Image not found')
        }
        throw err;
    });
    res.type('png');
    res.end(file);
}

module.exports.deleteEntry =  async (req, res, next) => {
    const entryId = req.params.entryId;
    var entry = await entryService.getEntryById(entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    if (entry.imageUrls != null && entry.imageUrls.length !== 0) {
        entry.imageUrls.forEach(url => {
            storageService.deleteImage(url)
        }); 
    }
    await entryService.deleteEntryById(entryId);
    res.sendStatus(202);
}

module.exports.getImageText = async (req, res, next) => {
    const image = req.file;
    await storageService.saveImages([image]);
    const text = await aiService.getImageText(image);
    storageService.deleteImage(image.url);
    res.send(text);
}