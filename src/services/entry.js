const Entry = require('../models/entry');

module.exports.getEntriesByUserId = (userId, resPerPage, page) => {
    return Entry.find({ userId: userId }, null, { decrypt: true })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .sort('-date')
        .exec();
}

module.exports.getEntriesByUserIdAndDateRange = (userId, startDate, endDate, resPerPage, page) => {
    return Entry.find({ 
        userId: userId,
        date: { "$gte": startDate, "$lte": endDate }
    }, null, { decrypt: true })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .sort('-date')
        .exec();
}

module.exports.getAllEntriesByUserIdAndDateRange = (userId, startDate, endDate) => {
    return Entry.find({ 
        userId: userId ,
        date: { "$gte": startDate, "$lte": endDate }
    }, null, { decrypt: true }).exec();
}

module.exports.getEntryById = (entryId, decrypt=true) => {
    return Entry.findById(entryId, null, { decrypt }).exec();
}

module.exports.saveEntryMetadata = (userId, title, date, form) => {
    return new Entry({
            userId,
            title,
            date,
            form
        }).save({ decrypt: true })
}

module.exports.saveEntry = (userId, title, date, text, score, form, keywords) => {
    return new Entry({
            userId,
            title,
            date,
            text,
            score,
            form,
            keywords
        }).save({ decrypt: true })
}

module.exports.deleteEntry = (entry) => {
    return entry.remove()
}

module.exports.editEntry = (entry, newData) => {
    return entry.set(newData).save({ decrypt: true });
}