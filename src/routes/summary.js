/**
 * Manages and generates summary data
 */

const aiService = require('../services/ai');
const entryService = require('../services/entry');

/**
 * Gets a summary of the entry text in a date range for a user
 */
module.exports.getSummary = async (req, res, next) => {
    const entries = await entryService.getAllEntriesByUserIdAndDateRange(
        req.userId,
        new Date(req.query.startDate),
        new Date(req.query.endDate)
    )
    const text = entries.map(entry => entry.text).join(" ").replace("\n", " ")
    if (text.length > 200) {  // TODO - configure
        const mlRes = await aiService.getEntriesSummary(text, Number(req.query.sentences));
        res.send({ "summary": mlRes.summary });
    } else {
        res.send({ "summary": "" })
    }  
}