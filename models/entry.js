var mongoose = require('mongoose');

var entrySchema = new mongoose.Schema({ 
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'need a user id']
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
    text: {
        type: String,
    },
    score: Number,
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

module.exports = mongoose.model('Entry', entrySchema);