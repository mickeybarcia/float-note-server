const { USER_ID } = require('./userConstants');
const Entry = require('../models/entry');

module.exports.DATA_KEY = 'key';
module.exports.ENTRY_ID = '456';
module.exports.START_DATE = '2010-07-06T19:52:57.282Z';
module.exports.END_DATE = '2030-07-06T19:52:57.282Z';
module.exports.IMAGE_URL = 'image.png';
module.exports.TEXT_FORM = "text";
module.exports.IMAGE_FORM = "image";
module.exports.TEXT = `happy happy sad sad`;
module.exports.TITLE = 'title';
module.exports.SCORE = "0.2";
module.exports.KEYWORDS = ['sad', 'happy'];
module.exports.DATE = new Date('2010-07-06T19:52:57.282Z');
module.exports.LONG_TEXT = `happy happy sad sad sad DAD MAD LAD sad sad happy (?) sad sad sad
RAD sad dad BAD happ happy happy happy happy happy sad sad sad DAD
MAD LAD sad sad happy (?) sad sad sad RAD sad dad BAD happ happy happy happy`;
module.exports.IMAGE_BUFFER = 'buffer';
module.exports.ENC_IMAGE_BUFFER = 'xxbufferxx';

module.exports.ENTRY = Entry({
    userId: USER_ID,
    title: module.exports.TITLE,
    date: module.exports.DATE,
    form: module.exports.TEXT_FORM,
    text: module.exports.TEXT,
    score: module.exports.SCORE,
    keywords: module.exports.KEYWORDS,
    imageUrls: []
});
module.exports.ENTRY_META_DATA = Entry({
    _id: module.exports.ENTRY_ID,
    userId: USER_ID,
    title: module.exports.TITLE,
    date: module.exports.DATE,
    form: module.exports.IMAGE_FORM,
    imageUrls: []
});
module.exports.LONG_ENTRY = Entry({
    userId: module.exports.USER_ID,
    title: 'good day',
    date: new Date('2000-01-02T02:02:20.326Z'),
    form: module.exports.TEXT_FORM,
    text: module.exports.LONG_TEXT,
    score: "0.2",
    keywords: ['sad', 'dad', 'happy']
});
module.exports.IMAGE_ENTRY = Entry({
    userId: module.exports.USER_ID,
    title: module.exports.TITLE,
    date: module.exports.DATE,
    form: module.exports.TEXT_FORM,
    text: module.exports.TEXT,
    score: module.exports.SCORE,
    keywords: module.exports.KEYWORDS,
    imageUrls: [ module.exports.IMAGE_URL ]
});

module.exports.ML_RES_TEXT = {
    keywords: module.exports.KEYWORDS,
    score: module.exports.SCORE
};