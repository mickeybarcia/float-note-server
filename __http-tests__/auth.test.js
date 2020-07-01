const expect = require('chai').expect
const request = require('supertest')
const testDb  = require('./testDb')
const app = require('../app')

describe('register and then login', () => {
    testDb()
    it('creates a new unique user that you can login with', next => {
        const res = await request(app).post('/auth/register')
            .send()

    })
})