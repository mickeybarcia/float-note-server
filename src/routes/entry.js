const entryService = require('../services/entry');
const aiService = require('../services/ai');
const userService = require('../services/user')
const storageService = require('../services/storage');
const { decryptDataKey } = require('../services/key');
const { getDate, getShortDate } = require('../utils/date')
const { encryptAesBuffer, decryptAesBuffer } = require('../handlers/encryptor')
const NotFoundError = require('../error/notFoundError')
const config = require('../config');

const RESULTS_PER_PAGE = 10

/**
 * Gets a page of entries for a optional date range
 */
module.exports.getEntries = async (req, res, next) => {
    const page = (req.query && req.query.page) || 1; 
    let entries;
    if (req.query.startDate && req.query.endDate) {
        entries = await entryService.getEntriesByUserIdAndDateRange(
            req.userId, 
            getShortDate(req.query.startDate), 
            getShortDate(req.query.endDate), 
            RESULTS_PER_PAGE, 
            page
        );
    } else {
        entries = await entryService.getEntriesByUserId(req.userId, RESULTS_PER_PAGE, page); 
    }
    entries = entries.map(entry => entry.toObject());
    res.send({ entries });
}

/**
 * Gets an entry by ID
 */
module.exports.getEntry = async (req, res, next) => {
    let entry = await entryService.getEntryById(req.params.entryId);
    if (!entry) throw new NotFoundError('Entry not found');
    res.send(entry.toObject());
}

/**
 * Adds and analyzes a text entry,
 * or uploads the metadata of an entry that needs images analyzed
 */
module.exports.addEntry = async (req, res, next) => {
    const form = req.body.form
    if (form == "text") {  // upload whole entry
        const text = req.body.text
        const mlRes = await aiService.analyzeEntry(text)
        var entry = await entryService.saveEntry(
            req.userId, 
            req.body.title, 
            getDate(req.body.date), 
            text, 
            mlRes.score.toString(), 
            form, 
            mlRes.keywords
        );
    } else {  // just upload metadata
        var entry = await entryService.saveEntryMetadata(
            req.userId, 
            req.body.title, 
            getDate(req.body.date), 
            form
        )
    }
    res.location('entries/' + entry._id);
    res.send(entry.toObject());
}

/**
 * If entry is an image entry, get images from req, analyze, and save new data
 * else if a test image, reanalyze if the text changes, and apply other changes
 */
module.exports.editEntry = async (req, res, next) => {
    var images = req.files
    var entry = await entryService.getEntryById(req.params.entryId)
    if (!entry) throw NotFoundError('Entry not found')
    if (images != null) { // you are adding an image
        try {
            images = images.map(image => {  // name the images
                image.url = Date.now() + image.originalname
                return image
            })
            const mlRes = await aiService.analyzeEntryFromImages(images)
            entry = await entryService.editEntry(entry, {
                text: mlRes.text,
                score: mlRes.score.toString(),
                keywords: mlRes.keywords,
                imageUrls: images.map(image => image.url)  // save the names
            })
            images.forEach(async (image) => {
                image.buffer = encryptAesBuffer(entry._dataKey, image.buffer)  // encrypt the images
                await storageService.saveImage(image)  // save the images 
            })
        } catch (err) {  // delete the meta data if image upload fails
            if (config.env == 'production') await entryService.deleteEntry(entry);
            throw err;
        }
    } else {  // you are editing the entry fields
        const text = req.body.text
        if (text) {
            const mlRes = await aiService.analyzeEntry(text)
            req.body.score = mlRes.score.toString()
            req.body.keywords = mlRes.keywords
        }
        entry = await entryService.editEntry(entry, req.body)
    }
    res.location('entries/' + entry._id);  
    res.send(entry.toObject());
}

/**
 * Get an image for an entry
 */
module.exports.getEntryImage = async (req, res, next) => {
    const imageUrl = req.params.location
    const entry = await entryService.getEntryById(req.params.entryId, false)
    if (entry.imageUrls.includes(imageUrl)) {
        const user = await userService.getUserById(req.userId, false)
        const [ dataKey, encBuffer ] = await Promise.all([
            decryptDataKey(user.encryptedDataKey),
            storageService.getImage(imageUrl).catch(err => {
                if (err.code == 404) throw new NotFoundError('Image not found')
                throw err;
            })
        ])
        const decBuffer = decryptAesBuffer(dataKey, encBuffer)
        res.type('png');
        res.end(decBuffer);
    } else {
        throw new Error('Image does not exist for this user');
    }
}

/**
 * Remove an entry
 */
module.exports.deleteEntry =  async (req, res, next) => {
    const entryId = req.params.entryId;
    var entry = await entryService.getEntryById(entryId);
    if (!entry) throw new NotFoundError('Entry not found');
    if (entry.imageUrls != null && entry.imageUrls.length !== 0) {
        entry.imageUrls.forEach(url => storageService.deleteImage(url)); 
    }
    await entryService.deleteEntry(entry);
    res.sendStatus(202);
}

/**
 * Get text for an image
 */
module.exports.getImageText = async (req, res, next) => {
    const text = await aiService.getImageText(req.file);
    res.send({ text });
}