const User = require('../../models/user')
const Entry = require('../../models/entry')
const { generateJWT } = require('../../handlers/auth')
const { 
  USER_ID, 
  USERNAME,
  PASSWORD,
  MENTAL_HEALTH_STATUS,
  GENDER,
  AGE,
  EMAIL 
} = require('../../__tests__/userConstants')
const { TEXT_FORM, IMAGE_FORM } = require('../../__tests__/entryConstants')

module.exports.mochaAsync = (fn) => {
    return (done) => {
      fn.call()
        .then(done, (err) => { done(err) });
    };
  };

module.exports.getToken = async () => generateJWT(USER_ID)

module.exports.getTestUser = async (decrypt=true) => await User.findById(USER_ID, null, { decrypt })

module.exports.saveTestUser = async () => {
  await new User({
    _id: USER_ID,
    username: USERNAME,
    email: EMAIL,
    password: PASSWORD,
    mentalHealthStatus: MENTAL_HEALTH_STATUS,
    gender: GENDER,
    age: AGE
  }).save({ encrypt: true })
}

module.exports.saveTestEntries = async (numText, numImage) => {
  const promises = []
  Array.from(Array(numText)).forEach(() => {
    promises.push(Entry.create({
      text: getWordArray(20).join(' '),
      title: getWordArray(5).join(' '),
      score: Math.random(),
      keywords: getWordArray(5).join(' '),
      form: TEXT_FORM,
      userId: USER_ID
    }))
  })
  Array.from(Array(numImage)).forEach(() => {
    promises.push(Entry.create({
      text: getWordArray(20).join(' '),
      title: getWordArray(5).join(' '),
      form: IMAGE_FORM,
      score: Math.random(),
      keywords: getWordArray(5).join(' '),
      imageUrls: [ String(Date.now()) + '.jpg' ],
      userId: USER_ID
    }))
  })
  await Promise.all(promises)
}

getWordArray = (numWords) => {
  const sampleWords = ['sad', 'today', 'bad', 'cry', 'lonely']
  const len = sampleWords.length
  return Array.from(Array(numWords)).map(() => sampleWords[ Math.floor(Math.random() * len) ])
}