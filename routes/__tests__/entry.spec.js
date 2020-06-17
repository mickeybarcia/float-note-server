const NotFoundError = require('../../error/notFoundError')
const entryService = require('../../services/entry');
const aiService = require('../../services/ai');
const storageService = require('../../services/storage');
const keyService = require('../../services/key');
const encryptor = require('../../handlers/encryptor')
const entryUtil = require('../../utils/entry')
const userUtil = require('../../utils/user')
const entryRoute = require('../entry')
const { getShortDate } = require('../../utils/date')
const { 
    NEXT, 
    ENC_DATA_KEY, 
    DATA_KEY, 
    USER_ID,
    ENC_TITLE,
    ENC_TEXT,
    ENC_SCORE,
    ENC_KEYWORDS,
    TEXT,
    DATE,
    TITLE,
    KEYWORDS,
    SCORE,
    ML_RES_TEXT,
    ENC_ENTRY,
    TEXT_FORM,
    ENTRY,
    IMAGE_FORM,
    ENC_ENTRY_META_DATA,
    LONG_DEC_ENTRY,
    START_DATE,
    END_DATE,
    IMAGE_URL,
    IMAGE_ENTRY,
    ENC_IMAGE_BUFFER,
    IMAGE_BUFFER,
    ENTRY_ID
} = require('./constants')

// mocks
jest.mock('../services/entry');
jest.mock('../services/ai');
jest.mock('../services/storage');
jest.mock('../services/key');
jest.mock('../handlers/encryptor');
jest.mock('../utils/entry');

let RESPONSE = { send: jest.fn() }

describe('add entry', () => {
    RESPONSE.location = jest.fn()
    it('adds and analyzes a text entry', async () => {
        const req = {
            userId: USER_ID,
            body: {
                form: TEXT_FORM,
                title: TITLE,
                text: TEXT,
                date: DATE
            }
        }
        userUtil.getEncryptedDataKeyForUser = jest.fn().mockReturnValue(Promise.resolve(ENC_DATA_KEY))
        keyService.decryptDataKey.mockResolvedValue(Promise.resolve(DATA_KEY))
        aiService.analyzeEntry.mockResolvedValue(Promise.resolve(ML_RES_TEXT))
        entryUtil.getEncryptedEntryValues = jest.fn().mockReturnValue([ ENC_TEXT, ENC_TITLE, ENC_SCORE, ENC_KEYWORDS ])
        entryService.saveEntry.mockResolvedValue(ENC_ENTRY)
        entryUtil.convertEntryToPlaintext = jest.fn().mockReturnValue(ENTRY)
        entryUtil.convertModelToObject = jest.fn().mockReturnValue(ENTRY)
        await entryRoute.addEntry(req, RESPONSE, NEXT)
        userUtil.getEncryptedDataKeyForUser = jest.fn().mockReturnValue(Promise.resolve(ENC_DATA_KEY))
        expect(keyService.decryptDataKey).toBeCalledWith(ENC_DATA_KEY)
        expect(aiService.analyzeEntry).toBeCalledWith(TEXT)
        expect(entryUtil.getEncryptedEntryValues).toBeCalledWith(TEXT, TITLE, SCORE, KEYWORDS, DATA_KEY)
        expect(entryService.saveEntry).toBeCalledWith(
            USER_ID, 
            ENC_TITLE,
            new Date(DATE),
            ENC_TEXT,
            ENC_SCORE,
            TEXT_FORM,
            ENC_KEYWORDS
        )
        expect(entryUtil.convertEntryToPlaintext).toBeCalledWith(ENC_ENTRY, TEXT, TITLE, SCORE.toString(), KEYWORDS)
        expect(RESPONSE.send).toHaveBeenCalledWith(ENTRY);
    })
    it('uploads the metadata of an image entry', async () => {
        const req = {
            userId: USER_ID,
            body: {
                form: IMAGE_FORM,
                title: TITLE,
                date: DATE
            }
        }
        userUtil.getEncryptedDataKeyForUser = jest.fn().mockReturnValue(Promise.resolve(ENC_DATA_KEY))
        keyService.decryptDataKey.mockResolvedValue(Promise.resolve(DATA_KEY))
        entryService.saveEntryMetadata.mockResolvedValue(Promise.resolve(ENC_ENTRY_META_DATA))
        encryptor.encryptAes = jest.fn().mockReturnValue(ENC_TITLE)
        entryUtil.convertModelToObject = jest.fn().mockReturnValue(ENC_ENTRY_META_DATA)
        await entryRoute.addEntry(req, RESPONSE, NEXT)
        expect(keyService.decryptDataKey).toBeCalledWith(ENC_DATA_KEY)
        expect(encryptor.encryptAes).toBeCalledWith(DATA_KEY, TITLE)
        expect(entryService.saveEntryMetadata).toBeCalledWith(
            USER_ID,
            ENC_TITLE,
            new Date(DATE),
            IMAGE_FORM
        )
        expect(RESPONSE.send).toHaveBeenCalledWith(ENC_ENTRY_META_DATA);
    })
})

describe('get entries', () => {
    const req = {
        query: {
            startDate: START_DATE,
            endDate: END_DATE
        },
        userId: USER_ID
    }
    it('gets a page of entries for a date range', async () => {
        entryService.getEntriesByUserIdAndDateRange.mockResolvedValue(Promise.resolve([ ENC_ENTRY, ENC_ENTRY ]))
        userUtil.getDataKeyForUser = jest.fn().mockReturnValue(Promise.resolve(DATA_KEY))
        entryUtil.decryptEntry = jest.fn()
            .mockImplementationOnce(() => ENTRY)
            .mockImplementationOnce(() => LONG_DEC_ENTRY)
        entryUtil.convertModelToObject = jest.fn()
            .mockImplementationOnce(() => ENTRY)
            .mockImplementationOnce(() => LONG_DEC_ENTRY)
        await entryRoute.getEntries(req, RESPONSE, NEXT)
        expect(entryService.getEntriesByUserIdAndDateRange).toBeCalledWith(USER_ID, getShortDate(START_DATE), getShortDate(END_DATE), 10, 1)
        expect(userUtil.getDataKeyForUser).toBeCalledWith(USER_ID)
        expect(entryUtil.decryptEntry).toHaveBeenCalledWith(ENC_ENTRY, DATA_KEY)
        expect(RESPONSE.send).toHaveBeenCalledWith({ entries: [ ENTRY, LONG_DEC_ENTRY ]});
    })
    it('returns an empty list of entries if none are found', async () => {
        entryService.getEntriesByUserIdAndDateRange.mockResolvedValue(Promise.resolve([]))
        await entryRoute.getEntries(req, RESPONSE, NEXT)
        expect(RESPONSE.send).toHaveBeenCalledWith({ entries: []});
    })
})

describe('get entry image', () => {
    const req = { 
        params: 
        { 
            entryId: ENTRY_ID,
            location: IMAGE_URL  
        },
        userId: USER_ID
    }
    it('gets an image for an entry', async () => {
        entryService.getEntryById.mockResolvedValue(IMAGE_ENTRY)
        userUtil.getEncryptedDataKeyForUser.mockResolvedValue(ENC_DATA_KEY)
        keyService.decryptDataKey.mockResolvedValue(DATA_KEY)
        storageService.getImage.mockResolvedValue(ENC_IMAGE_BUFFER)
        encryptor.decryptAesBuffer = jest.fn().mockReturnValue(IMAGE_BUFFER)
        RESPONSE.end = jest.fn()
        RESPONSE.type = jest.fn()
        await entryRoute.getEntryImage(req, RESPONSE, NEXT)
        expect(entryService.getEntryById).toBeCalledWith(req.params.entryId)
        expect(userUtil.getEncryptedDataKeyForUser).toBeCalledWith(USER_ID)
        expect(keyService.decryptDataKey).toBeCalledWith(ENC_DATA_KEY)
        expect(storageService.getImage).toBeCalledWith(IMAGE_URL)
        expect(encryptor.decryptAesBuffer).toBeCalledWith(DATA_KEY, ENC_IMAGE_BUFFER)
        expect(RESPONSE.end).toBeCalledWith(IMAGE_BUFFER)
    })
})