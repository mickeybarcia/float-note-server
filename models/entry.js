var mongoose = require('mongoose');
const { decryptAes, encryptAes } = require('../handlers/encryptor')
const { getUserById } = require('../services/user')
const { decryptDataKey } = require('../services/key') 

const encryptedFields = ['title', 'text', 'score', 'keywords']

var entrySchema = new mongoose.Schema({ 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'need a user id'],
        ref: 'User' 
    },
    title: {
        type: String,
        required: [true, 'need title']
    },
    date: Date,
    form: {
        type: String,
        enum: ["text", "image", "voice"]
    },
    text: String,
    score: String,
    keywords: Array,
    imageUrls:  Array
});

entrySchema.pre('validate', function(next) {
    if (this.form == "text" && (this.text == null || this.text == "")) {
        next(new Error('text form requires text'));
    } else {
        next();
    }
});

entrySchema.pre('save', async function() {
    this._original = this.toObject()
    this._dataKey = await this.getDataKeyFromUserId()
    encryptedFields.map(field => this.encrypt(field))
    next()
})

entrySchema.post('save', function() {
    encryptedFields.map(field => this.setToPlaintext(field))
    next()
})

entrySchema.post("findOne", async function (doc, next) {
    if (doc && this.options.decrypt) {
        doc._dataKey = await this.getDataKeyFromUserId()
        encryptedFields.map(field => this.decrypt(field, doc))
    }
    next()
})

entrySchema.post("find", async function (docs, next) {
    this._dataKey = await this.getDataKeyFromUserId()
    docs.forEach(doc => encryptedFields.map(field => this.decrypt(field, doc)))
    next()
})

entrySchema.methods.getDataKeyFromUserId = async function() {
    const userId = this.getQuery().userId
    const user = await getUserById(userId, false)
    const dataKey = await decryptDataKey(user.encryptedDataKey)
    return dataKey
}

entrySchema.methods.encrypt = function(fieldName) {
    const shouldEncrypt = (this[fieldName] && this.isNew) || (!this.isNew && this.isModified(fieldName))
    if (shouldEncrypt) {
        if (Array.isArray(this[fieldName])) {
            this[fieldName].map(item => encryptAes(this._dataKey, item))
        } else {
            this[fieldName] = encryptAes(this._dataKey, this[fieldName])
        }
    }
}

entrySchema.methods.decrypt = function(fieldName, doc) {
    if (doc[fieldName]) {
        if (Array.isArray(doc[fieldName])) {
            doc[fieldName].map(item => decryptAes(doc._dataKey, item))
        } else {
            doc[fieldName] = decryptAes(doc._dataKey, doc[fieldName])
        }
    }
}

entrySchema.setToPlaintext = function(fieldName) {
    this[fieldName] = this._original[fieldName]
}

module.exports = mongoose.model('Entry', entrySchema);