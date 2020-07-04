const expect = require('chai').expect
const request = require('supertest')
const { setupDB } = require('./utils/testDb')
const app = require('../app') 
const { USERNAME, USER } = require('../__tests__/userConstants')
const { mochaAsync, getToken, getTestUser, saveTestUser } = require('./utils/utils')

setupDB()

describe('edit user', () => {
    beforeEach(mochaAsync(async () => saveTestUser() ))
    it('updates usernames',  mochaAsync(async () => {
        // checks if username is taken
        usernameCheckRes = await request(app).post('/api/v1/user/username')
            .set('Authorization', await getToken())
            .send({ username: USERNAME })
        expect(usernameCheckRes.body.isUnique).to.equal(false)

        // updates the username if it is not taken
        const anotherUsername = 'anotherUsername'
        usernameUpdateRes = await request(app).put('/api/v1/user/username')
            .set('Authorization', await getToken())
            .send({ username: anotherUsername })
        expect(usernameUpdateRes.status).to.equal(200)
        const user = await getTestUser()
        expect(user.username).to.equal(anotherUsername)
    }))
    it('updates user profiles',  mochaAsync(async () => {
        // updates gender
        var newGender = 'new gender'
        await request(app).patch('/api/v1/user')
            .set('Authorization', await getToken())
            .send({ gender: newGender })

        // updates mental health status
        var newStatus = 'new status'
        await request(app).patch('/api/v1/user')
            .set('Authorization', await getToken())
            .send({ mentalHealthStatus: newStatus })

        const user = await getTestUser()
        expect(user.gender).to.equal(newGender)
        expect(user.mentalHealthStatus).to.equal(newStatus)
    }))
})