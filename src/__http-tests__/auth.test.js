const expect = require('chai').expect
const request = require('supertest')
const { setupDB } = require('./utils/testDb')
const app = require('../app')  // TODO - seperate app and server to isolate server and mongo connection
const { REGISTER_REQ_BODY, USER_ID, USERNAME, PASSWORD } = require('../__tests__/userConstants')
const User = require('../models/user')
const { EmailToken, PasswordToken } = require('../models/emailToken')
const { mochaAsync, saveTestUser, getToken } = require('./utils/utils')

setupDB()

describe('register and login', () => {
    it('creates a new user you can authenticate with and verify', mochaAsync(async () => {
        // register works
        const registerRes = await request(app).post('/api/v1/auth/register').send(REGISTER_REQ_BODY)
        expect(registerRes.body).to.have.all.keys('token', 'isCreated')

        // register does not work with non unique username
        const badRegisterRes = await request(app).post('/api/v1/auth/register').send(REGISTER_REQ_BODY)
        expect(badRegisterRes.body.isCreated).to.equal(false)
        
        // register token works, can get correct decrypted user
        var userRes = await request(app).get('/api/v1/user').set('Authorization', registerRes.body.token)
        expect(String(userRes.body.age)).to.equal(REGISTER_REQ_BODY.age)

        // login works
        const loginRes = await request(app).post('/api/v1/auth/login').send({ 
            usernameOrEmail: userRes.body.username,
            password: REGISTER_REQ_BODY.password
        })
        expect(loginRes.body).to.have.all.keys('token')

        // login token works
        userRes = await request(app).get('/api/v1/user').set('Authorization', loginRes.body.token)
        userId = userRes.body.id

        // user in encrypted in db
        const encryptedUser = await User.findById(userId)
        expect(encryptedUser.age).to.not.equal(REGISTER_REQ_BODY.age)
        
        // new user is unverified, then able to be verified
        expect(encryptedUser.isVerified).to.equal(false)
        const emailToken = await EmailToken.findOne({ userId })
        verifyRes = await request(app).get('/api/v1/verify/' + emailToken.token)
        const verifiedUser = await User.findById(userId)
        expect(verifiedUser.isVerified).to.equal(true)

        // delete user
        await request(app).delete('/api/v1/user').set('Authorization', loginRes.body.token)
        const user = await User.findById(userId)
        expect(user).to.equal(null)
    }))
    it('throws error for missing or wrong token', mochaAsync(async () => {
        // bad token
        var userRes = await request(app).get('/api/v1/user').set('Authorization', 'bad token')
        expect(userRes).to.have.property('status', 401)

        // missing token
        userRes = await request(app).get('/api/v1/user')
        expect(userRes).to.have.property('status', 403)
    }))
})

describe('resets password', () => {
    beforeEach(mochaAsync(async () => saveTestUser() ))
    it('allows you to forget your password', mochaAsync(async () => {
        await request(app).post('/api/v1/auth/forgotPassword').send({ usernameOrEmail: USERNAME })
        const passwordToken = await PasswordToken.findOne({ userId: USER_ID })

        const newPassword = 'newPassword123'
        await request(app).post('/api/v1/auth/resetPassword/' + passwordToken.token).send({ 
            password: newPassword,
            confirmPassword: newPassword
        })

        // can login now
        const loginRes = await request(app).post('/api/v1/auth/login').send({ 
            usernameOrEmail: USERNAME,
            password: newPassword
        })
        expect(loginRes.body).to.have.all.keys('token')
    }))
    it('allows you to update your password', mochaAsync(async () => {
        const newPassword = 'newPassword123'
        await request(app).put('/api/v1/user/password')
            .set('Authorization', await getToken())
            .send({ 
                newPassword: newPassword,
                oldPassword: PASSWORD
            })
            
        // can login now
        const loginRes = await request(app).post('/api/v1/auth/login').send({ 
            usernameOrEmail: USERNAME,
            password: newPassword
        })
        expect(loginRes.body).to.have.all.keys('token')
    }))
})

describe('resets email', () => {
    beforeEach(mochaAsync(async () => saveTestUser() ))
    it('allows you to update email and verify', mochaAsync(async () => {
        const newEmail = 'newEmail@gmail.com'
        await request(app).put('/api/v1/user/email')
            .set('Authorization', await getToken())
            .send({ email: newEmail })

        // email is updated
        const user = await User.findById(USER_ID)
        expect(user.email).to.equal(newEmail)
        
        // user is unverified, then able to be verified
        expect(user.isVerified).to.equal(false)
        const emailToken = await EmailToken.findOne({ userId: USER_ID })
        verifyRes = await request(app).get('/api/v1/verify/' + emailToken.token)
        const verifiedUser = await User.findById(USER_ID)
        expect(verifiedUser.isVerified).to.equal(true)
    }))
})