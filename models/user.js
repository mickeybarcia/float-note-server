var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const { generateDataKey, decryptDataKey } = require('../services/key') 
const { encryptAes, encryptPassword, decryptAes } = require('../handlers/encryptor');
const { isEmail } = require('../utils/email')

const encryptedFields = ['mentalHealthStatus', 'gender', 'age']

var userSchema = new mongoose.Schema({
    username: {
        type: String, 
        //minlength: [2, 'username must be at least 2 characters.'],
        //maxlength: [20, 'username must be less than 20 characters.'],
        unique: true,
        required: [ true, 'username cannot be blank' ]
    },
    age: {
        type: String,
        required: [ true, 'age cannot be blank' ],
        //min: [10, 'not a valid age'],
        //max: [150, 'not a valid age']
    },
    gender: String,
    mentalHealthStatus: String,
    password: {
        type: String, 
        set: encryptPassword,
        required: [ true, 'need a password' ] 
    },
    email: {
        type: String, 
        required: [ true, 'email cannot be blank' ]
    },
    encryptedDataKey: {
        type: Buffer, 
        required: [ true, 'need a data key' ]
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
});

userSchema.path('password').validate(password => {
    return password.length >= 6  //p.match(/\d+/g) &&  // include a number 
}, 'password needs to be longer than or equal to 6 letters');

userSchema.path('email').validate(email => {
    return isEmail(email);
}, 'needs to be a valid email');

userSchema.pre('validate', async function(next) {
    if (!this.encryptedDataKey) this.encryptedDataKey = await generateDataKey()
    next()
})

userSchema.pre('save', async function() {
    this._original = this.toObject()
    if (!this._dataKey) this._dataKey = await decryptDataKey(this.encryptedDataKey)
    encryptedFields.map(field => this.encrypt(field))
})

userSchema.post('save', function() {
    encryptedFields.map(field => this.setToPlaintext(field))
})

userSchema.post("findOne", async function(doc, next) {
    if (doc && this.options.decrypt) {
        doc._dataKey = await decryptDataKey(doc.encryptedDataKey)
        encryptedFields.forEach(field => this.schema.methods.decrypt(field, doc))
    }
    next()
})

userSchema.options.toObject = {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id
        delete ret.encryptedDataKey;
        delete ret.password;
        return ret;
    }
}

userSchema.methods.encrypt = function(fieldName) {
    const shouldEncrypt = (this[fieldName] && this.isNew) || (!this.isNew && this.isModified(fieldName))
    if (shouldEncrypt) {
        if (Array.isArray(this[fieldName])) {
            this[fieldName].map(item => encryptAes(this._dataKey, item))
        } else {
            this[fieldName] = encryptAes(this._dataKey, this[fieldName])
        }
    }
}

userSchema.methods.decrypt = function(fieldName, doc) {
    if (doc[fieldName]) {
        if (Array.isArray(doc[fieldName])) {
            doc[fieldName].map(item => decryptAes(doc._dataKey, item))
        } else {
            doc[fieldName] = decryptAes(doc._dataKey, doc[fieldName])
        }
    }
}

userSchema.methods.setToPlaintext = function(fieldName) {
    this[fieldName] = this._original[fieldName]
}

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema );