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
    })
}

module.exports.getEntryById = (entryId) => {
    return Entry.findById(entryId).exec();
}

module.exports.saveEntryMetadata = (userId, title, date, form) => {
    return Entry.create({
        userId : userId,
        title: title,
        date: date,
        form: form,
        text: ""
    });
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

module.exports.deleteEntryById = (id) => {
    return Entry.findByIdAndRemove(id).exec();
}

module.exports.editEntry = (entryId, newData) => {
    return Entry.findOneAndUpdate({ _id: entryId }, { $set: newData }, { new: true });
}