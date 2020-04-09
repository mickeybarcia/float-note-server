const aiService = require('../services/ai');
const entryService = require('../services/entry');

module.exports.getSummary = async (req, res, next) => {
    const entries = await entryService.getEntriesByUserId(req.userId); 
    const mlRes = await aiService.getEntriesSummary(getEntriesText(entries), Number(req.query.sentences));
    res.send({ "summary": mlRes.summary });
}

function getEntriesText(entries) {
    texts = [];
    entries.forEach(function(element) {
        texts.push(element.text);
    });
    return texts.join(" ").replace("\n", " ");
}