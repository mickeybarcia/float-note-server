const summaryRoute = require('../routes/summary')
const keyService = require('../services/key') 
const entryService = require('../services/entry');
const aiService = require('../services/ai');

jest.mock('../services/key');
jest.mock('../services/entry');
jest.mock('../services/ai');

const NEXT = () => {}
const RESPONSE = { send: jest.fn() }
const ENC_DATA_KEY = 'xxkeyxx'
const DATA_KEY = 'key'
const TEST_ENC_ENTRIES = [
    {}
]
const TEST_DEC_ENTRIES = [
    {}
]
describe('get summary', () => {
    const req = {
        query: {
            startDate: '01/01/2000',
            endDate: '01/01/2001'
        },
        userId: '123'
    }
    it('returns a summary', async () => {
        keyService.getEncryptedDataKeyForUser.mockResolvedValue(Promise.resolve())
        keyService.decryptDataKey.mockResolvedValue(DATA_KEY)
        entryService.getAllEntriesByUserIdAndDateRange.mockResolvedValue(TEST_ENC_ENTRIES)
        encryptor.decryptAes = jest.fn().mockReturnValue() // *** // 
        await summaryRoute.getSummary(req, RESPONSE, NEXT)
        
        expect(keyService.getEncryptedDataKeyForUser).toBeCalledWith(req.userId)
        expect(keyService.decryptDataKey).toBeCalledWith(ENC_DATA_KEY)

    })
    it('returns an empty summary if theres not enough data', async () => {

    })
})