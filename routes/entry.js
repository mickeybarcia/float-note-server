const entryService = require('../services/entry');
const aiService = require('../services/ai');
const storageService = require('../services/storage');
const { getDate, getShortDate } = require('../util/date')
const NotFoundError = require('../error/notFoundError')
const { decryptDataKey } = require('../services/key');
const { encryptAES, decryptAES } = require('../handlers/encryptor')
const { 
    decryptEntry, 
    getEncryptedEntryValues, 
    convertModelToObject, 
    getEncryptedDataKey, 
    convertEntryToPlaintext 
} = require('../util/data')

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
    const encryptedDataKey = await getEncryptedDataKey(req.userId)
    const dataKey = await decryptDataKey(encryptedDataKey).catch(err => { throw err })
    entries = entries.map(entry => convertModelToObject(decryptEntry(entry, dataKey)));
    res.send({ entries: entries });
}

module.exports.getEntry = async (req, res, next) => {
    const entry = await entryService.getEntryById(req.params.entryId);
    if (!entry) {
        throw new NotFoundError('Entry not found');
    }
    const encryptedDataKey = await getEncryptedDataKey(req.userId)
    const dataKey = await decryptDataKey(encryptedDataKey).catch(err => { throw err })
    entry = convertModelToObject(decryptEntry(entry, dataKey))
    res.send(entry);
}

module.exports.addEntry = async (req, res, next) => {
    const date = getDate(req.body.date);
    const form = req.body.form;
    const encryptedDataKey = await getEncryptedDataKey(req.userId)

    // upload whole entry
    if (form == "text") { 

        // encrypt the entry (and analyze text at same time)
        const [dataKey, mlRes] = await Promise.all([
            decryptDataKey(encryptedDataKey).catch(err => { throw err }),
            aiService.analyzeEntry(form, req.body.text)
        ])

        const [ encryptedText, encryptedTitle, encryptedScore, encryptedKeywords ] = await getEncryptedEntryValues(req.body.text, req.body.title, mlRes.score, mlRes.keywords, dataKey)
        var entry = await entryService.saveEntry(req.userId, encryptedTitle, date, encryptedText, encryptedScore, form, encryptedKeywords);
        entry = convertEntryToPlaintext(entry, req.body.text, req.body.title, mlRes.score.toString(), mlRes.keywords) 

    // just upload metadata
    } else {  
        const dataKey = await decryptDataKey(encryptedDataKey).catch(err => { throw err })
        var entry = await entryService.saveEntryMetadata(req.userId, encryptAES(dataKey, req.body.title), date, form);
        entry.title = req.body.title
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

    // you are adding an image
    if (req.files != null) { 
        try {
            const images = req.files;
            await storageService.saveImages(images).catch(err => { throw err });

            // encrypt the entry (and analyze text at same time)
            const encryptedDataKey = await getEncryptedDataKey(req.userId)
            const [ dataKey, mlRes ] = await Promise.all([
                decryptDataKey(encryptedDataKey).catch(err => { throw err }),
                aiService.analyzeEntryFromImages(images)
            ])
            
            const [ encryptedText, encryptedTitle, encryptedScore, encryptedKeywords ] = await getEncryptedEntryValues(mlRes.text, null, mlRes.score, mlRes.keywords, dataKey)
            entry = await entryService.editEntry(
                entry._id, 
                { 
                    text: encryptedText,
                    score: encryptedScore, 
                    keywords: encryptedKeywords, 
                    imageUrls: images.map(image => image.url)
                }
            );            
            entry = convertEntryToPlaintext(entry, req.body.text, decryptAES(dataKey, entry.title), mlRes.score.toString(), mlRes.keywords) 
            
        } catch(err) {  // delete the meta data if image upload fails
            await entryService.deleteEntryById(entryId);
            throw err;
        }

    // you are editing the entry fields
    } else {
        // decrypt current entry to see if we need to analyze and encrypt
        const encryptedDataKey = await getEncryptedDataKey(req.userId)
        const dataKey = await decryptDataKey(encryptedDataKey).catch(err => { throw err })
        const currentEntry = await decryptEntry(entry, dataKey)
    
        // you edited the text
        reqText = req.body.text;
        reqTitle = req.body.title;
        if (currentEntry.text != null && reqText != null && currentEntry.text != reqText) { 
            const mlRes = await aiService.analyzeEntry(req.body.form, reqText)
            const [ encryptedText, encryptedTitle, encryptedScore, encryptedKeywords ] = getEncryptedEntryValues(reqText, reqTitle, mlRes.score, mlRes.keywords, dataKey)
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
            entry = await entryService.editEntry(entry._id, { title: encryptAES(dataKey, reqTitle) });   
            entry = decryptEntry(entry, dataKey)
            
        // you edited something else
        } else  { 
            entry = await entryService.editEntry(entry._id, { date: getDate(req.body.date) });   
            entry = decryptEntry(entry, dataKey)
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