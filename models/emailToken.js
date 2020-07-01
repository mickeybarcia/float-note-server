
var mongoose = require('mongoose');
var { encryptPassword, random } = require('../handlers/encryptor')

const tokenSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true, 
        unique: true,
        ref: 'User' 
    },
    token: { 
        type: String, 
        required: true,
        default: random()
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now, 
        expires: 43200 
    }
});

module.exports.EmailToken = mongoose.model('EmailToken', tokenSchema);

var passwordTokenSchema = tokenSchema;

module.exports.PasswordToken = mongoose.model('PasswordToken', passwordTokenSchema);