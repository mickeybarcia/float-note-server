/**
 * Manages and generates summary data
 */

const { getShortDate } = require('../utils/date')
const encryptor = require('../handlers/encryptor')
const aiService = require('../services/ai');
const entryService = require('../services/entry');
const keyService = require('../services/key')
const userUtil = require('../utils/user')

/**
 * Gets a summary of the entry text in a date range for a user
 */
module.exports.getSummary = async (req, res, next) => {
    const startDate = new Date(getShortDate(req.query.startDate));
    const endDate = new Date(getShortDate(req.query.endDate));
    const encryptedDataKey = await userUtil.getEncryptedDataKeyForUser(req.userId)
    const [ dataKey, entries ] = await Promise.all([
        keyService.decryptDataKey(encryptedDataKey).catch(err => { throw err }),
        entryService.getAllEntriesByUserIdAndDateRange(req.userId, startDate, endDate)
    ])
    const text = entries.map(entry => encryptor.decryptAes(dataKey, entry.text)).join(" ").replace("\n", " ")
    if (text.length > 200) {  // TODO - configure
        const mlRes = await aiService.getEntriesSummary(text, Number(req.query.sentences));
        res.send({ "summary": mlRes.summary });
    } else {
        res.send({ "summary": "" })
    }  
}