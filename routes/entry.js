const entryService = require('../services/entry');
const aiService = require('../services/ai');
const storageService = require('../services/storage');
const { getDate, getShortDate } = require('../util/date')
const NotFoundError = require('../error/notFoundError')

function convertModelToObject(entry) {
    return entry.toObject({ getters: true })
}

module.exports.getEntries = async (req, res, next) => {
    const resPerPage = 10; 
    const page = req.params.page || 1; 
    var startDate = req.query.startDate;
    if (startDate) {
        var endDate = req.query.endDate;
        startDate = new Date(getShortDate(startDate));
        endDate = new Date(getShortDate(endDate));
        entries = await entryService.getEntriesByUserIdAndDateRange(req.userId, startDate, endDate, resPerPage, page);
    } else {
        entries = await entryService.getEntriesByUserId(req.userId, resPerPage, page); 
    }
    entries = entries.map(function (entry) {
        return convertModelToObject(entry)
    });
    res.send({entries: entries});
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
    if (form == "text") {
        console.log("Uploading whole entry.");
        const mlRes = await aiService.analyzeEntry(form, req.body.text);
        var entry = await entryService.saveEntry(req.userId, req.body.title, date, req.body.text, mlRes.score, form, mlRes.keywords);
    } else {
        console.log("Just uploading metadata.");
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
            await storageService.saveImages(images);
            const mlRes = await aiService.analyzeEntryFromImages(images);
            entry = await entryService.saveEntryAnalytics(entry, mlRes.text, mlRes.score, mlRes.keywords, images);
        } catch(err) {  // delete the meta data if image upload fails
            await entryService.deleteEntryById(entryId);
            throw err;
        }
    } else { // you are editing the entry fields
        reqForm = req.body.form;
        reqText = req.body.text;
        currentText = entry.text;
        date = getDate(req.body.date);
        if (currentText != null && currentText != reqText) { // you edited the text
            const mlRes = await aiService.analyzeEntry(reqForm, reqText);
            entry = await entryService.editEntry(entry, req.body.title, date, reqText, mlRes.score, reqForm, mlRes.keywords);
        } else { // you edited something else
            entry = await entryService.editEntry(entry, req.body.title, date, reqText, entry.score, reqForm, entry.keywords);
        }
    }
    entry = convertModelToObject(entry)
    res.location('entries/' + entry._id);                        
    res.send(entry);
}

module.exports.getEntryImage = async (req, res, next) => {  // TODO - check for permission to view image
    const file = await storageService.getImage(req.params.location);
    res.type('png') ;
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