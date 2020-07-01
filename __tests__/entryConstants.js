module.exports.ENC_DATA_KEY = 'xxkeyxx'
module.exports.DATA_KEY = 'key'
module.exports.ENTRY_ID = '456'
module.exports.START_DATE = '2000-01-01'
module.exports.END_DATE = '2001-01-01'
module.exports.IMAGE_URL = 'image.png'
module.exports.TEXT_FORM = "text"
module.exports.IMAGE_FORM = "image"
module.exports.TEXT = `happy happy sad sad`
module.exports.TITLE = 'title'
module.exports.SCORE = 0.2
module.exports.KEYWORDS = ['sad', 'happy']
module.exports.DATE = '2000-01-03T02:02:20.326Z'
module.exports.LONG_DEC_TEXT = `happy happy sad sad sad DAD MAD LAD sad sad happy (?) sad sad sad
RAD sad dad BAD happ happy happy happy happy happy sad sad sad DAD
MAD LAD sad sad happy (?) sad sad sad RAD sad dad BAD happ happy happy happy`

module.exports.ENC_IMAGE_BUFFER = 'xxbufferxx'
module.exports.IMAGE_BUFFER = 'buffer'

module.exports.ENC_TEXT = 'xxtextxx'
module.exports.ENC_TITLE = 'xxtitlexx'
module.exports.ENC_SCORE = 'xxscorexx'
module.exports.ENC_KEYWORDS = ['xxwordxx', 'xxwordxx']

module.exports.ENC_ENTRY = {
    userId: module.exports.USER_ID,
    title: module.exports.ENC_TITLE,
    date: module.exports.DATE,
    form: module.exports.TEXT_FORM,
    text: module.exports.ENC_TEXT,
    score: module.exports.ENC_SCORE,
    keywords: module.exports.ENC_KEYWORDS
}
module.exports.ENTRY = {
    userId: module.exports.USER_ID,
    title: module.exports.TITLE,
    date: module.exports.DATE,
    form: module.exports.TEXT_FORM,
    text: module.exports.TEXT,
    score: module.exports.SCORE,
    keywords: module.exports.KEYWORDS
}
module.exports.LONG_DEC_ENTRY = {
    userId: module.exports.USER_ID,
    title: 'good day',
    date: '2000-01-02T02:02:20.326Z',
    form: module.exports.TEXT_FORM,
    text: module.exports.LONG_DEC_TEXT,
    score: 0.2,
    keywords: ['sad', 'dad', 'happy']
}
module.exports.ENC_ENTRY_META_DATA = {
    userId: module.exports.USER_ID,
    title: module.exports.ENC_TITLE,
    date: module.exports.DATE,
    form: module.exports.IMAGE_FORM
}
module.exports.IMAGE_ENTRY = {
    userId: module.exports.USER_ID,
    title: module.exports.TITLE,
    date: module.exports.DATE,
    form: module.exports.TEXT_FORM,
    text: module.exports.TEXT,
    score: module.exports.SCORE,
    keywords: module.exports.KEYWORDS,
    imageUrls: [ module.exports.IMAGE_URL ]
}

module.exports.ML_RES_TEXT = {
    keywords: module.exports.KEYWORDS,
    score: module.exports.SCORE
}