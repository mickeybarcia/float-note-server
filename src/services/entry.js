const Entry = require('../models/entry');

module.exports.getEntriesByUserId = (userId, resPerPage, page, decrypt=true) => {
    return Entry.find({ userId: userId }, null, { decrypt })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .sort('-date')
        .exec();
};

module.exports.getEntriesByUserIdAndDateRange = (
    userId, 
    startDate, 
    endDate, 
    resPerPage, 
    page, 
    decrypt=true
) => {
    return Entry.find({ 
        userId: userId,
        date: { "$gte": startDate, "$lte": endDate }
    }, null, { decrypt })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .sort('-date')
        .exec();
};

module.exports.getAllEntriesByUserIdAndDateRange = (userId, startDate, endDate, decrypt=true) => {
    return Entry.find({ 
        userId: userId ,
        date: { "$gte": startDate, "$lte": endDate }
    }, null, { decrypt }).exec();
};

module.exports.getEntryById = (entryId, decrypt=true) => {
    return Entry.findById(entryId, null, { decrypt }).exec();
};

module.exports.saveEntryMetadata = (userId, title, date, form, decrypt=true) => {
    return new Entry({
            userId,
            title,
            date,
            form
        }).save({ decrypt });
};

module.exports.saveEntry = (userId, title, date, text, score, form, keywords, decrypt=true) => {
    return new Entry({
            userId,
            title,
            date,
            text,
            score,
            form,
            keywords
        }).save({ decrypt });
};

module.exports.deleteEntry = (entry) => {
    return entry.remove();
};

module.exports.editEntry = (entry, newData, decrypt=true) => {
    return entry.set(newData).save({ decrypt });
};