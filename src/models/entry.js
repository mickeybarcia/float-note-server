var mongoose = require('mongoose');
const { decryptAes, encryptAes } = require('../handlers/encryptor')
const { getUserById } = require('../services/user')
const { decryptDataKey } = require('../services/key') 

const encryptedFields = ['title', 'text', 'score', 'keywords']

var entrySchema = new mongoose.Schema({ 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [ true, 'need a user id' ],
        ref: 'User' 
    },
    title: {
        type: String,
        required: [ true, 'need title' ]
    },
    date: {
        type: Date,
        default: Date.now(),
        required: [ true, 'need date' ]
    },
    form: {
        type: String,
        enum: [ "text", "image", "voice" ]
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
    if (this._isDecrypted && this.$__.saveOptions.decrypt) {
        this._original = this.toObject()
    }
    if (this.isNew || !this._dataKey) {
        this._dataKey = await this.getDataKeyFromUserId(this.userId)
    }
    encryptedFields.map(field => this.encrypt(field))
})

entrySchema.post('save', function() {
    if (this._original) {
        encryptedFields.map(field => this.setToPlaintext(field))
    } else if (this.$__.saveOptions.decrypt) {
        encryptedFields.map(field => this.decrypt(field, this, this._dataKey))
    }
})

entrySchema.post("findOne", async function (doc, next) {
    if (doc && this.options.decrypt) {
        this._isDecrypted = true
        const dataKey = await this.schema.methods.getDataKeyFromUserId(doc.userId)
        encryptedFields.map(field => this.schema.methods.decrypt(field, doc, dataKey))
    }
    next()
})

entrySchema.post("find", async function (docs, next) {
    const shouldDecrypt = docs.length > 0 && this.getQuery().userId && this.options.decrypt
    if (shouldDecrypt) {  // TODO - make configurable
        const dataKey = await this.schema.methods.getDataKeyFromUserId(this.getQuery().userId)
        docs.forEach(doc => {
            encryptedFields.map(field => this.schema.methods.decrypt(field, doc, dataKey))
        })
    }
    next()
})

entrySchema.methods.getDataKeyFromUserId = async function(userId) {
    const user = await getUserById(userId, false)
    return await decryptDataKey(user.encryptedDataKey)
}

entrySchema.methods.encrypt = function(fieldName) {
    const shouldEncrypt = (this[fieldName] && this.isNew) || (!this.isNew && this.isModified(fieldName))
    if (shouldEncrypt) {
        if (Array.isArray(this[fieldName])) {
            this[fieldName] = this[fieldName].map(item => encryptAes(this._dataKey, item))
        } else {
            this[fieldName] = encryptAes(this._dataKey, this[fieldName])
        }
    }
}

entrySchema.methods.decrypt = function(fieldName, doc, dataKey) {
    if (doc[fieldName]) {
        if (Array.isArray(doc[fieldName])) {
            doc[fieldName] = doc[fieldName].map(item => decryptAes(dataKey, item))
        } else {
            doc[fieldName] = decryptAes(dataKey, doc[fieldName])
        }
    }
}

entrySchema.methods.setToPlaintext = function(fieldName) {
    this[fieldName] = this._original[fieldName]
}

entrySchema.options.toObject = {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        ret.score = Number(ret.score)
        delete ret._id
        delete ret.encryptedDataKey;
        delete ret.password;
        delete ret.userId
        return ret;
    }
}

module.exports = mongoose.model('Entry', entrySchema);