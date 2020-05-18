const aiService = require('../services/ai');
const entryService = require('../services/entry');
const { getShortDate } = require('../util/date')
const { decryptAES } = require('../handlers/encryptor')
const { getEncryptedDataKey } = require('../util/data')
const { decryptDataKey } = require('../services/key')

module.exports.getSummary = async (req, res, next) => {
    const startDate = new Date(getShortDate(req.query.startDate));
    const endDate = new Date(getShortDate(req.query.endDate));
    const encryptedDataKey = await getEncryptedDataKey(req.userId)
    const [ dataKey, entries ] = await Promise.all([
        decryptDataKey(encryptedDataKey).catch(err => { throw err }),
        entryService.getAllEntriesByUserIdAndDateRange(req.userId, startDate, endDate)
    ])
    const text = entries.map(entry => decryptAES(dataKey, entry.text)).join(" ").replace("\n", " ")
    if (text.length > 200) {
        const mlRes = await aiService.getEntriesSummary(text, Number(req.query.sentences));
        res.send({ "summary": mlRes.summary });
    } else {
        res.send({ "summary": "" })
    }  
}