const summaryRoute = require('../summary')
const keyService = require('../../services/key') 
const entryService = require('../../services/entry');
const aiService = require('../../services/ai');
const encryptor = require('../../handlers/encryptor');
const userUtil = require('../../utils/user')
const { 
    NEXT, 
    ENC_DATA_KEY, 
    DATA_KEY, 
    USER_ID,
    TEXT,
    LONG_DEC_TEXT,
    ENC_ENTRY,
    START_DATE,
    END_DATE
} = require('./constants')

jest.mock('../services/key');
jest.mock('../services/entry');
jest.mock('../services/ai');
jest.mock('../handlers/encryptor');

const RESPONSE = { send: jest.fn() }
const SUMMARY = { summary: 'summary' }

describe('get summary', () => {
    const numSentences = 4
    const req = {
        query: {
            startDate: START_DATE,
            endDate: END_DATE,
            sentences: numSentences
        },
        userId: USER_ID
    }
    userUtil.getEncryptedDataKeyForUser = jest.fn().mockReturnValue(Promise.resolve(ENC_DATA_KEY))
    keyService.decryptDataKey.mockResolvedValue(DATA_KEY)
    it('returns a summary', async () => {
        const allText = (LONG_DEC_TEXT + ' ' + TEXT).replace("\n", " ")
        entryService.getAllEntriesByUserIdAndDateRange.mockResolvedValue([ ENC_ENTRY, ENC_ENTRY ])
        encryptor.decryptAes = jest.fn()
            .mockImplementationOnce(() => LONG_DEC_TEXT)
            .mockImplementationOnce(() => TEXT); 
        aiService.getEntriesSummary.mockResolvedValue(Promise.resolve(SUMMARY))
        await summaryRoute.getSummary(req, RESPONSE, NEXT)
        expect(userUtil.getEncryptedDataKeyForUser).toBeCalledWith(USER_ID)
        expect(keyService.decryptDataKey).toBeCalledWith(ENC_DATA_KEY)
        expect(aiService.getEntriesSummary).toBeCalledWith(allText, numSentences)
        expect(RESPONSE.send).toHaveBeenCalledWith(SUMMARY);
    })
    it('returns an empty summary if theres not enough data', async () => {
        entryService.getAllEntriesByUserIdAndDateRange.mockResolvedValue([ ENC_ENTRY ])
        encryptor.decryptAes = jest.fn().mockReturnValue(TEXT) 
        await summaryRoute.getSummary(req, RESPONSE, NEXT)
        expect(RESPONSE.send).toHaveBeenCalledWith({ summary: ""});
    })
})