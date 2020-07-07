const expect = require('chai').expect
const request = require('supertest')
const { setupDB } = require('./utils/testDb')
const app = require('../app') 
const { TEXT, TEXT_FORM, TITLE, IMAGE_FORM, START_DATE, END_DATE } = require('../__tests__/entryConstants')
const { mochaAsync, getToken, saveTestUser, saveTestEntries, getTestUser } = require('./utils/utils')
const Entry = require('../models/entry')
const path = require('path')
const { getImage } = require('../services/storage')

setupDB()

describe('create and edit entry', () => {
    beforeEach(mochaAsync(async () => saveTestUser()))
    it('creates and edits a text entry',  mochaAsync(async () => {
        // add entry
        const entryRes = await request(app).post('/api/v1/entries')
            .set('Authorization', await getToken())
            .send({
                text: TEXT,
                form: TEXT_FORM,
                title: TITLE
            })
        
        // verify encrypted
        const entryId = entryRes.body.id
        var entry = await Entry.findById(entryId)
        expect(entry.text).to.not.equal(TEXT)

        // verify decrypted
        entry = await Entry.findById(entryId, null, { decrypt: true })
        expect(entryRes.body.text).to.equal(entry.text)
        expect(entryRes.body.text).to.equal(TEXT)
        expect(entryRes.body.score).to.be.greaterThan(0)

        // edit entry
        const newTitle = 'new title'
        const newText = 'new text'
        const editRes = await request(app).put('/api/v1/entries/' + entryId)
            .set('Authorization', await getToken())
            .send({
                text: newText,
                title: newTitle
            })
        
        // verify changes
        var newEntry = await Entry.findById(entryId)
        expect(newEntry.text).to.not.equal(newText)
        newEntry = await Entry.findById(entryId, null, { decrypt: true })
        expect(editRes.body.text).to.equal(newEntry.text)
        expect(editRes.body.text).to.equal(newText)
        expect(editRes.body.score).to.not.equal(entry.score)

        // delete entry
        await request(app).delete('/api/v1/entries/' + entryId).set('Authorization', await getToken())
        entry = await Entry.findById(entryId)
        expect(entry).to.equal(null)
    }))
    it('creates and edit an image entry',  mochaAsync(async () => {
        // add metadata
        const entryRes = await request(app).post('/api/v1/entries')
            .set('Authorization', await getToken())
            .send({
                form: IMAGE_FORM,
                title: TITLE
            })
        const entryId = entryRes.body.id
        var entry = await Entry.findById(entryId)
        expect(entry.title).to.not.equal(TITLE)
        expect(entry.score).to.not.exist

        // add images
        const editRes = await request(app).put('/api/v1/entries/' + entryId)
            .set('Authorization', await getToken())
            .attach('page', path.join(__dirname, '/constants/validImage.jpg'))
            .attach('page', path.join(__dirname, '/constants/validImage.jpg'))

        // verify encrypted
        entry = await Entry.findById(entryId)
        expect(entry.title).to.not.equal(TITLE)

        // verify decrypted
        entry = await Entry.findById(entryId, null, { decrypt: true })
        expect(entry.text).to.not.equal(null)
        expect(editRes.body.text).to.not.equal(null)
        expect(editRes.body.score).to.be.greaterThan(0)
        expect(editRes.body.imageUrls.length).to.equal(2)

        // get images
        const imageUrl = entry.imageUrls[0]
        const imagesRes = await request(app).get('/api/v1/entries/' + entryId + '/images/' + imageUrl)
            .set('Authorization', await getToken())
        const storedImage = await getImage(imageUrl)
        expect(imagesRes.body).to.exist
        expect(imagesRes.body).to.not.equal(storedImage)  // **

        // TODO - delete images
    }))
    it('can get image text', mochaAsync(async () => {
        // valid
        var textRes = await request(app).post('/api/v1/entries/images')
            .set('Authorization', await getToken())
            .attach('page', path.join(__dirname, '/constants/validImage.jpg'))
        expect(textRes.body.text).to.not.equal(null)

        // invalid
        textRes = await request(app).post('/api/v1/entries/images')
            .set('Authorization', await getToken())
            .attach('page', path.join(__dirname, '/constants/invalidImage.png'))
        expect(textRes.body.text).to.equal('')
    }))
})

describe('get entries', () => {
    beforeEach(mochaAsync(async () => saveTestUser()))
    it('gets entries',  mochaAsync(async () => {
        // no results
        const res = await request(app).get('/api/v1/entries?startDate=' + START_DATE + '&endDate=' + END_DATE)
            .set('Authorization', await getToken())
        expect(res.body.entries.length).to.equal(0)
        
        // page 1
        await saveTestEntries(10, 15)
        const res1 = await request(app).get('/api/v1/entries?startDate=' + START_DATE + '&endDate=' + END_DATE)
            .set('Authorization', await getToken())
        expect(res1.body.entries.length).to.equal(10)

        // page 2
        const res2 = await request(app).get('/api/v1/entries?startDate=' + START_DATE + '&endDate=' + END_DATE + '&page=2')
            .set('Authorization', await getToken())
        expect(res2.body.entries).to.not.include.any.members(res1.body.entries);

        // page 3
        const res3 = await request(app).get('/api/v1/entries?startDate=' + START_DATE + '&endDate=' + END_DATE + '&page=3')
            .set('Authorization', await getToken())
        expect(res3.body.entries.length).to.equal(5)

        // verify decrypted
        const decEntry = res3.body.entries[0]
        const encEntry = await Entry.findById(decEntry.id)
        expect(decEntry.text).to.not.equal(encEntry.text)
    }))
})