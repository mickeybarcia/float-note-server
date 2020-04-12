const aiService = require('../services/ai');
const entryService = require('../services/entry');
const { getShortDate } = require('../util/date')

module.exports.getSummary = async (req, res, next) => {
    var startDate = req.query.startDate;
    if (startDate) {
        var endDate = req.query.endDate;
        startDate = new Date(getShortDate(startDate));
        endDate = new Date(getShortDate(endDate));
    }
    const entries = await entryService.getAllEntriesByUserIdAndDateRange(req.userId, startDate, endDate); 
    const text = getEntriesText(entries);
    if (text.length > 200) {
        const mlRes = await aiService.getEntriesSummary(text, Number(req.query.sentences));
        res.send({ "summary": mlRes.summary });
    } else {
        res.send({ "summary": "" })
    }  
}

function getEntriesText(entries) {
    texts = [];
    entries.forEach(function(element) {
        texts.push(element.text);
    });
    return texts.join(" ").replace("\n", " ");
}