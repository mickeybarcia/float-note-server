const expect = require('chai').expect
const request = require('supertest')
const { setupDB } = require('./utils/testDb')
const app = require('../app') 
const { START_DATE, END_DATE } = require('../__tests__/entryConstants')
const { mochaAsync, getToken, saveTestEntries, saveTestUser } = require('./utils/utils')

setupDB()

describe('summary', () => {
    beforeEach(mochaAsync(async () => saveTestUser()))
    it('gets a summary',  mochaAsync(async () => {
        await saveTestEntries(10, 15)
        const summaryRes = await request(app).get('/api/v1/summary?startDate=' + START_DATE + '&endDate=' + END_DATE + '&sentences=4')
            .set('Authorization', await getToken())
        expect(summaryRes.body.summary.length).to.be.greaterThan(0)
    }))
    it('returns nothing if there is not enough to summarize',  mochaAsync(async () => {
        // not enough text
        await saveTestEntries(1, 0)
        var summaryRes = await request(app).get('/api/v1/summary?startDate=' + START_DATE + '&endDate=' + END_DATE + '&sentences=4')
            .set('Authorization', await getToken())
        expect(summaryRes.body.summary.length).to.equal(0)

        // no entries
        summaryRes = await request(app).get('/api/v1/summary?startDate=' + START_DATE + '&endDate=' + START_DATE + '&sentences=4')
            .set('Authorization', await getToken())
        expect(summaryRes.body.summary.length).to.equal(0)
    }))
})