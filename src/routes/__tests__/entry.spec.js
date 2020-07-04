jest.mock('../../services/entry');
jest.mock('../../services/ai');
jest.mock('../../services/storage');
jest.mock('../../services/key');
jest.mock('../../services/user');
jest.mock('../../handlers/encryptor');

const entryService = require('../../services/entry');
const aiService = require('../../services/ai');
const storageService = require('../../services/storage');
const userService = require('../../services/user');
const entryRoute = require('../entry')
const { getShortDate } = require('../../utils/date')
const { decryptDataKey } = require('../../services/key') 
const { decryptAesBuffer } = require('../../handlers/encryptor')
const { 
    DATA_KEY, 
    TEXT,
    DATE,
    TITLE,
    KEYWORDS,
    SCORE,
    ML_RES_TEXT,
    TEXT_FORM,
    ENTRY,
    ENTRY_META_DATA,
    IMAGE_FORM,
    LONG_ENTRY,
    START_DATE,
    END_DATE,
    IMAGE_URL,
    IMAGE_ENTRY,
    ENC_IMAGE_BUFFER,
    IMAGE_BUFFER,
    ENTRY_ID
} = require('../../__tests__/entryConstants')
const { USER_ID, USER, ENC_DATA_KEY } = require('../../__tests__/userConstants')

let RESPONSE = { send: jest.fn() }
let NEXT = () => {}

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
        aiService.analyzeEntry.mockResolvedValue(Promise.resolve(ML_RES_TEXT))
        entryService.saveEntry.mockResolvedValue(ENTRY)
        await entryRoute.addEntry(req, RESPONSE, NEXT)
        expect(aiService.analyzeEntry).toBeCalledWith(TEXT)
        expect(entryService.saveEntry).toBeCalledWith(
            USER_ID, 
            TITLE,
            DATE,
            TEXT,
            SCORE,
            TEXT_FORM,
            KEYWORDS
        )
        expect(RESPONSE.send).toHaveBeenCalledWith(ENTRY.toObject());
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
        entryService.saveEntryMetadata.mockResolvedValue(ENTRY_META_DATA)
        await entryRoute.addEntry(req, RESPONSE, NEXT)
        expect(entryService.saveEntryMetadata).toBeCalledWith(
            USER_ID,
            TITLE,
            DATE,
            IMAGE_FORM
        )
        expect(RESPONSE.send).toHaveBeenCalledWith(ENTRY_META_DATA.toObject());
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
        entryService.getEntriesByUserIdAndDateRange.mockResolvedValue(Promise.resolve([ ENTRY, LONG_ENTRY ]))
        await entryRoute.getEntries(req, RESPONSE, NEXT)
        expect(entryService.getEntriesByUserIdAndDateRange).toBeCalledWith(
            USER_ID, 
            getShortDate(START_DATE), 
            getShortDate(END_DATE), 
            10, 
            1
        )
        expect(RESPONSE.send).toHaveBeenCalledWith({ entries: [ ENTRY.toObject(), LONG_ENTRY.toObject() ]});
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
        userService.getUserById.mockResolvedValue(USER)
        decryptDataKey.mockResolvedValueOnce(DATA_KEY)
        storageService.getImage.mockResolvedValue(ENC_IMAGE_BUFFER)
        decryptAesBuffer.mockReturnValueOnce(IMAGE_BUFFER)
        RESPONSE.end = jest.fn()
        RESPONSE.type = jest.fn()
        await entryRoute.getEntryImage(req, RESPONSE, NEXT)
        expect(entryService.getEntryById).toBeCalledWith(req.params.entryId, false)
        expect(userService.getUserById).toBeCalledWith(USER_ID, false)
        expect(storageService.getImage).toBeCalledWith(IMAGE_URL)
        expect(decryptAesBuffer).toBeCalledWith(DATA_KEY, ENC_IMAGE_BUFFER)
        expect(RESPONSE.end).toBeCalledWith(IMAGE_BUFFER)
    })
})