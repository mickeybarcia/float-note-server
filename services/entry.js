const Entry = require('../models/entry');

module.exports.getEntriesByUserId = (userId, resPerPage, page) => {
    return Entry.find({ userId: userId })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .sort('-date')
        .exec();
}

module.exports.getEntriesByUserIdAndDateRange = (userId, startDate, endDate, resPerPage, page) => {
    return Entry.find({ 
        userId: userId ,
        date: { "$gte": startDate, "$lte": endDate }
    })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .sort('-date')
        .exec();
}

module.exports.getAllEntriesByUserIdAndDateRange = (userId, startDate, endDate) => {
    return Entry.find({ 
        userId: userId ,
        date: { "$gte": startDate, "$lte": endDate }
    }).exec();
}

module.exports.getEntryById = (entryId, decrypt=true) => {
    return Entry.findById(entryId, null, { decrypt }).exec();
}

module.exports.saveEntryMetadata = (userId, title, date, form) => {
    return Entry.create({
        userId : userId,
        title: title,
        date: date,
        form: form
    })
}

module.exports.saveEntry = (userId, title, date, text, score, form, keywords) => {
    return Entry.create({
        userId : userId,
        title: title,
        date: date,
        text: text,
        score: score,
        form: form,
        keywords: keywords
    });
}

module.exports.deleteEntry = (entry) => {
    return entry.remove()
}

module.exports.editEntry = (entry, newData) => {
    return entry.set(newData).save();
}