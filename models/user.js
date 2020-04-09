var mongoose = require('mongoose');
const { encryptPassword } = require('../handlers/auth');
var uniqueValidator = require('mongoose-unique-validator');

var userSchema = new mongoose.Schema({
    userName: {
        type: String, 
        minlength: [2, 'username must be at least 2 characters.'],
        maxlength: [20, 'username must be less than 20 characters.'],
        unique: true,
        required: [true, 'username cannot be blank.']
    },
    age: {
        type: Number,
        required: [true, 'age cannot be blank.'],
        min: [10, 'not a valid age'],
        max: [150, 'not a valid age']
    },
    gender: String,
    mentalHealthStatus: String,
    password: {
        type: String, 
        required: [true, 'need a password'] 
    }
});

userSchema.path('password').validate(function(p) {
    return p.match(/\d+/g) && p.length >= 6
}, 'password needs to be longer than 6 letters and to include a number');

userSchema.pre('save', function(next) {
    var user = this;
    user.password = encryptPassword(user.password);
    console.log("encrypted pw: " + user.password);
    next();
})

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema );