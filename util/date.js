module.exports.getDateFromString = (dateStr) => {
    const dateSplit = dateStr.split("-")
    return new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2])
}

module.exports.getDate = (dateString) => {
    return !dateString ? new Date() : new Date(dateString);
}