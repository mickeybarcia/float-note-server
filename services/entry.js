const Entry = require('../models/entry');

function getEntriesByUserId(userId, resPerPage, page) {
    return Entry.find({ userId: userId })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .sort('-date')
        .exec();
}

function getEntriesByUserIdAndDateRange(userId, startDate, endDate, resPerPage, page) {
    return Entry.find({ 
        userId: userId ,
        date: { "$gte": startDate, "$lte": endDate }
    })
        .skip((resPerPage * page) - resPerPage)
        .limit(resPerPage)
        .sort('-date')
        .exec();
}

function getAllEntriesByUserIdAndDateRange(userId, startDate, endDate) {
    return Entry.find({ 
        userId: userId ,
        date: { "$gte": startDate, "$lte": endDate }
    })
}

function getEntryById(entryId) {
    return Entry.findById(entryId).exec();
}

function saveEntryMetadata(userId, title, date, form) {
    return Entry.create({
        userId : userId,
        title: title,
        date: date,
        form: form,
        text: ""
    });
}

function saveEntry(userId, title, date, text, score, form, keywords) {
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

function deleteEntryById(id) {
    return Entry.findByIdAndRemove(id).exec();
}

function editEntry(entryId, newData) {
    return Entry.findOneAndUpdate({ _id: entryId }, { $set: newData }, { new: true });
}

module.exports = { 
    getEntriesByUserId, 
    getAllEntriesByUserIdAndDateRange, 
    getEntryById, 
    getEntriesByUserIdAndDateRange, 
    saveEntryMetadata, 
    saveEntry, 
    deleteEntryById, 
    editEntry 
 };