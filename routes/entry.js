const entryService = require('../services/entry');
const aiService = require('../services/ai');
const storageService = require('../services/storage');
const { getDate, getShortDate } = require('../util/date')
const NotFoundError = require('../error/notFoundError')
const keyService = require('../services/key');
const encryptor = require('../handlers/encryptor')
const entryUtil = require('../util/entry')

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
    const dataKey = await keyService.getDataKeyForUser(req.userId)
    entries = entries.map(entry => entryUtil.decryptEntry(entry, dataKey));
    entries = entries.map(entry => entryUtil.convertModelToObject(entry));
    res.send({ entries: entries });
}

module.exports.getEntry = async (req, res, next) => {
    const entry = await entryService.getEntryById(req.params.entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    const dataKey = await keyService.getDataKeyForUser(req.userId)
    entry = entryUtil.decryptEntry(entry, dataKey)
    entry = entryUtil.convertModelToObject(entry)
    res.send(entry);
}

// TODO - make this not return the entry
module.exports.addEntry = async (req, res, next) => {
    const date = getDate(req.body.date);
    const form = req.body.form;
    const encryptedDataKey = await keyService.getEncryptedDataKeyForUser(req.userId)

    // upload whole entry
    if (form == "text") { 

        // encrypt the entry (and analyze text at same time)
        const [dataKey, mlRes] = await Promise.all([
            keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err }),
            aiService.analyzeEntry(form, req.body.text)
        ])

        const [ 
            encryptedText, 
            encryptedTitle, 
            encryptedScore, 
            encryptedKeywords 
        ] = await entryUtil.getEncryptedEntryValues(req.body.text, req.body.title, mlRes.score, mlRes.keywords, dataKey)
        var entry = await entryService.saveEntry(req.userId, encryptedTitle, date, encryptedText, encryptedScore, form, encryptedKeywords);
        entry = entryUtil.convertEntryToPlaintext(entry, req.body.text, req.body.title, mlRes.score.toString(), mlRes.keywords) 

    // just upload metadata
    } else {  
        const dataKey = await keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err })
        var entry = await entryService.saveEntryMetadata(req.userId, encryptor.encryptAes(dataKey, req.body.title), date, form);
        entry.title = req.body.title
    }

    res.location('entries/' + entry._id);
    entry = entryUtil.convertModelToObject(entry)
    res.send(entry);
}

module.exports.editEntry = async (req, res, next) => {
    const entryId = req.params.entryId;
    var entry = await entryService.getEntryById(entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    const encryptedDataKey = await keyService.getEncryptedDataKeyForUser(req.userId)

    // you are adding an image
    if (req.files != null) { 
        try {
            // decrypt entry and analyze
            const images = req.files;
            const [ dataKey, mlRes ] = await Promise.all([
                keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err }),
                aiService.analyzeEntryFromImages(images)
            ])
            const [ 
                encryptedText, encryptedTitle, encryptedScore, encryptedKeywords 
            ] = entryUtil.getEncryptedEntryValues(mlRes.text, null, mlRes.score, mlRes.keywords, dataKey)
            entry = await entryService.editEntry(
                entry._id, 
                { 
                    text: encryptedText,
                    score: encryptedScore, 
                    keywords: encryptedKeywords, 
                    imageUrls: images.map(image => image.url)
                }
            );            
            entry = entryUtil.convertEntryToPlaintext(entry, req.body.text, encryptor.decryptAes(dataKey, entry.title), mlRes.score.toString(), mlRes.keywords) 

            // save images
            encryptedImages = encryptImages(images, dataKey)
            await storageService.saveImages(images).catch(err => { throw err });
        
        // delete the meta data if image upload fails
        } catch(err) {  
            await entryService.deleteEntryById(entryId);
            throw err;
        }

    // you are editing the entry fields
    } else {
        // decrypt current entry to see if we need to analyze and encrypt
        reqText = req.body.text;
        reqTitle = req.body.title;
        const dataKey = await keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err })
        const currentEntry = await entryUtil.decryptEntry(entry, dataKey)

        // you edited the text
        if (currentEntry.text != null && reqText != null && currentEntry.text != reqText) { 
            const mlRes = await aiService.analyzeEntry(req.body.form, reqText)
            const [ encryptedText, encryptedTitle, 
                encryptedScore, encryptedKeywords ] = entryUtil.getEncryptedEntryValues(reqText, reqTitle, mlRes.score, mlRes.keywords, dataKey)
            entry = await entryService.editEntry(
                entry._id, 
                { 
                    text: encryptedText,
                    score: encryptedScore, 
                    title: encryptedTitle,
                    keywords: encryptedKeywords
                }
            );   
            entry = convertEntryToPlaintext(entry, reqText, reqTitle, mlRes.score.toString(), mlRes.keywords) 

        // you just edited the title
        } else if (reqTitle != currentEntry.title) {  
            await entryService.editEntry(entry._id, { title: encryptor.encryptAes(dataKey, reqTitle) });   
            entry = entryUtil.convertEntryToPlaintext(entry, reqText, reqTitle, currentEntry.score, currentEntry.keywords) 
            
        // you edited something else
        } else  { 
            const date = getDate(req.body.date)
            entry = await entryService.editEntry(entry._id, { date: date });   
            entry.date = date
        }
    }

    res.location('entries/' + entry._id);  
    entry = entryUtil.convertModelToObject(entry)                      
    res.send(entry);
}

module.exports.getEntryImage = async (req, res, next) => {  // TODO - check for permission to view image
    const encryptedDataKey = await keyService.getEncryptedDataKeyForUser(req.userId)
    const [ dataKey, file ] = await Promise.all([
        keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err }),
        storageService.getImage(req.params.location).catch(err => {
            if (err.code == 404) {
                throw new NotFoundError('Image not found')
            }
            throw err;
        })
    ])
    file.buffer = encryptor.decryptAesBuffer(dataKey, file.buffer)
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
        entry.imageUrls.forEach(storageService.deleteImage(url)); 
    }
    await entryService.deleteEntryById(entryId);
    res.sendStatus(202);
}

module.exports.getImageText = async (req, res, next) => {
    const text = await aiService.getImageText(req.file);
    res.send(text);
}