var { encryptPassword } = require('../handlers/encryptor')
var mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true, 
        unique: true,
        ref: 'User' 
    },
    token: { 
        type: String, 
        required: true 
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

passwordTokenSchema.pre('save', function(next) {
    var passwordToken = this;
    passwordToken.token = encryptPassword(passwordToken.token);
    next();
})

module.exports.PasswordToken = mongoose.model('PasswordToken', passwordTokenSchema);