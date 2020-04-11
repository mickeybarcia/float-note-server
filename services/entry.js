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

function saveEntryAnalytics(entry, text, score, keywords, images) {
    entry.text = text;
    entry.score = score;
    entry.keywords = keywords;
    entry.imageUrls = getImagesUrls(images);
    return entry.save();
}

function getImagesUrls(images) {
    var urls = [];
    images.forEach(function(image) {
        urls.push(image.url);
    });
    return urls;
}

function deleteEntryById(id) {
    return Entry.findByIdAndRemove(id).exec();
}

function editEntry(entry, title, date, text, score, form, keywords) {
    entry.title = title;
    entry.date = date;
    entry.text = text;
    entry.score = score;
    entry.form = form;
    entry.keywords = keywords;
    return entry.save();
}

module.exports = { getEntriesByUserId, getAllEntriesByUserIdAndDateRange, getEntryById, getEntriesByUserIdAndDateRange, saveEntryMetadata, saveEntry, saveEntryAnalytics, deleteEntryById, editEntry };