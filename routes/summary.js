const aiService = require('../services/ai');
const entryService = require('../services/entry');

module.exports.getSummary = async (req, res, next) => {
    const entries = await entryService.getEntriesByUserId(req.userId); 
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