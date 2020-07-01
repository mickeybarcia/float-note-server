const entryService = require('../services/entry');
const aiService = require('../services/ai');
const userService = require('../services/user')
const storageService = require('../services/storage');
const keyService = require('../services/key');
const { getDate, getShortDate } = require('../utils/date')
const encryptor = require('../handlers/encryptor')
const NotFoundError = require('../error/notFoundError')

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
    if (form == "text") {  // upload whole entry
        const text = req.body.text
        const mlRes = await aiService.analyzeEntry(text)
        var entry = await entryService.saveEntry(
            req.userId, 
            req.body.title, 
            getDate(req.body.date), 
            text, 
            mlRes.score.toString(), 
            req.body.form, 
            mlRes.keywords
        );
    } else {  // just upload metadata
        var entry = await entryService.saveEntryMetadata(
            req.userId, 
            req.body.title, 
            getDate(req.body.date), 
            req.body.form, 
            dataKey
        )
    }
    res.location('entries/' + entry._id);
    res.send(entry.toObject());
}

module.exports.editEntry = async (req, res, next) => {
    const reqImages = req.files
    var entry = entryService.getEntryById(req.params.entryId, false)
    if (!entry) throw NotFoundError('Entry not found')
    if (reqImages != null) { // you are adding an image
        try {
            var encryptedImages = reqImages.map(image => {
                image.url = Date.now() + image.originalname
                // image.buffer = encryptor.encryptAesBuffer(dataKey, image.buffer)
                return image
            })
            const mlRes = await aiService.analyzeEntryFromImages(reqImages)
            entry = await entryService.editEntry(entry, {
                text: mlRes.text,
                score: mlRes.score.toString(),
                keywords: mlRes.keywords,
                imageUrls: encryptedImages.map(image => image.url)
            })
            // TO DO - can we get _dataKey from the save entry and then encrypt images?
            await storageService.saveImages(encryptedImages).catch(err => { throw err });
        } catch (err) {
            // delete the meta data if image upload fails
            // await entryService.deleteEntry(entry);
            throw err;
        }
    } else { // you are editing the entry fields
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
    const entry = await entryService.getEntryById(req.params.entryId)
    if (entry.imageUrls.includes(imageUrl)) {
        const user = await userService.getUserById(entry.userId, false)
        const [ dataKey, encBuffer ] = await Promise.all([
            keyService.decryptDataKey(user.encryptedDataKey),
            storageService.getImage(imageUrl).catch(err => {
                if (err.code == 404) throw new NotFoundError('Image not found')
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
    if (!entry) throw new NotFoundError('Entry not found');
    if (entry.imageUrls != null && entry.imageUrls.length !== 0) {
        entry.imageUrls.forEach(storageService.deleteImage(url)); 
    }
    await entryService.deleteEntry(entry);
    res.sendStatus(202);
}

module.exports.getImageText = async (req, res, next) => {
    const text = await aiService.getImageText(req.file);
    res.send({ text });
}