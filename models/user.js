var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const { encryptPassword } = require('../handlers/encryptor');
const { isEmail } = require('../utils/email')

var userSchema = new mongoose.Schema({
    username: {
        type: String, 
        //minlength: [2, 'username must be at least 2 characters.'],
        //maxlength: [20, 'username must be less than 20 characters.'],
        unique: true,
        required: [true, 'username cannot be blank.']
    },
    age: {
        type: Number,
        required: [true, 'age cannot be blank.'],
        //min: [10, 'not a valid age'],
        //max: [150, 'not a valid age']
    },
    gender: String,
    mentalHealthStatus: String,
    password: {
        type: String, 
        required: [true, 'need a password'] 
    },
    email: {
        type: String, 
        required: [true, 'email cannot be blank']
    },
    encryptedDataKey: {
        type: Buffer, 
        required: [true, 'need a data key'] 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
});

userSchema.path('password').validate(function(p) {
    return p.length >= 6  //p.match(/\d+/g) &&  // include a number 
}, 'password needs to be longer than or equal to 6 letters');

userSchema.path('email').validate(function(e) {
    return isEmail(e);
}, 'needs to be a valid email');

userSchema.pre('save', function(next) {
    var user = this;
    user.password = encryptPassword(user.password);
    next();
})

userSchema.pre('findOneAndUpdate', async function(next) {
    if (this._update.$set && this._update.$set.password) {
      const newPassword = encryptPassword(this._update.$set.password)
      this._update.$set.password = newPassword
    }
    next()
})

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema );