const entryService = require('../services/entry');
const aiService = require('../services/ai');
const storageService = require('../services/storage');

module.exports.getEntries = async (req, res, next) => {
    var startDate = req.query.startDate;
    if (startDate) {
        var endDate = req.query.endDate;
        startDate = new Date(getDateFromString(startDate));
        endDate = new Date(getDateFromString(endDate));
        entries = await entryService.getEntriesByUserIdAndDateRange(req.userId, startDate, endDate);
    } else {
        entries = await entryService.getEntriesByUserId(req.userId); 
    }
    res.send({entries: entries});
}

function getDateFromString(dateStr) {
    return new Date(dateStr.split("-")[0], dateStr.split("-")[1] - 1, dateStr.split("-")[2])
}

module.exports.getEntry = async (req, res, next) => {
    const entry = await entryService.getEntryById(req.params.entryId);
    if (!entry) {
        var err = new Error('Entry not found');
        err.status = 404;
        throw err;
    }
    res.send(entry);
}

module.exports.addEntry = async (req, res, next) => {
    const date = getDate(req.body.date);
    const form = req.body.form;
    if (form == "text") {
        console.log("Uploading whole entry.");
        const mlRes = await aiService.analyzeEntry(form, req.body.text);
        const entry = await entryService.saveEntry(req.userId, req.body.title, date, req.body.text, mlRes.score, form, mlRes.keywords);
        res.location('entries/' + entry._id);
        res.send(entry);
    } else {
        console.log("Just uploading metadata.");
        const entry = await entryService.saveEntryMetadata(req.userId, req.body.title, date, form);
        res.location('entries/' + entry._id);
        res.send(entry);
    }
}

module.exports.editEntry = async (req, res, next) => {
    const entryId = req.params.entryId;
    var entry = await entryService.getEntryById(entryId);
    if (!entry) {
        var err = new Error('Entry not found');
        err.status = 404;
        throw err;
    }
    if (req.files != null) { // you are adding an image
        const images = req.files;
        await storageService.saveImages(images);
        const mlRes = await aiService.analyzeEntryFromImages(images);
        entry = await entryService.saveEntryAnalytics(entry, mlRes.text, mlRes.score, mlRes.keywords, images);
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
    res.location('entries/' + entry._id);                        
    res.send(entry);
}

function getDate(dateString) {
    return !dateString ? new Date() : new Date(dateString);
}

module.exports.getEntryImage = async (req, res, next) => {
    const file = await storageService.getImage(req.params.location);
    res.type('png') ;
    res.end(file);
}

module.exports.deleteEntry =  async (req, res, next) => {
    const entryId = req.params.entryId;
    var entry = await entryService.getEntryById(entryId);
    if (!entry) {
        var err = new Error('Entry not found');
        err.status = 404;
        throw err;
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