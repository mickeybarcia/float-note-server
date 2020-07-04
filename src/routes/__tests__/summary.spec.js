jest.mock('../../services/entry');
jest.mock('../../services/ai');

const summaryRoute = require('../summary')
const entryService = require('../../services/entry');
const aiService = require('../../services/ai');
const { 
    TEXT,
    LONG_TEXT,
    LONG_ENTRY,
    ENTRY,
    START_DATE,
    END_DATE
} = require('../../__tests__/entryConstants')
const { USER_ID } = require('../../__tests__/userConstants')

const RESPONSE = { send: jest.fn() }
let NEXT = () => {}
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
    it('returns a summary', async () => {
        const allText = [ TEXT, LONG_TEXT ].join(' ').replace("\n", " ")
        entryService.getAllEntriesByUserIdAndDateRange.mockResolvedValue([ ENTRY, LONG_ENTRY ])
        aiService.getEntriesSummary.mockResolvedValue(Promise.resolve(SUMMARY))
        await summaryRoute.getSummary(req, RESPONSE, NEXT)
        expect(aiService.getEntriesSummary).toBeCalledWith(allText, numSentences)
        expect(RESPONSE.send).toHaveBeenCalledWith(SUMMARY);
    })
    it('returns an empty summary if theres not enough data', async () => {
        entryService.getAllEntriesByUserIdAndDateRange.mockResolvedValue([ ENTRY ])
        await summaryRoute.getSummary(req, RESPONSE, NEXT)
        expect(RESPONSE.send).toHaveBeenCalledWith({ summary: ""});
    })
})