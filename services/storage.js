const { Storage } = require('@google-cloud/storage');
const config = require('../config');

const googleCloudStorage = new Storage({ 
    projectId: config.imageStorage.projectId,
    credentials: JSON.parse(config.imageStorage.storageKey)
});
const bucket = googleCloudStorage.bucket(config.imageStorage.projectId); 

function saveImages(images) {
    let promises = []
    images.forEach((file) => {
        // console.log(Math.round(file.size/1024) +'KB')
        const filename = file.url
        const blob = bucket.file(filename)
        const newPromise =  new Promise((resolve, reject) => {
            blob.createWriteStream({
                metadata: { contentType: file.mimetype }
            }).on('finish', async response => {
                file.url = filename
                await blob.makePrivate()
                resolve(response)
            }).on('error', err => {
                reject(new Error('Upload error: ' + err.message))
            }).end(file.buffer)
        });
       promises.push(newPromise);
    });
    return Promise.all(promises);
}

function getImage(filename) {
    var file = bucket.file(filename);
    return file.download().then((data) => {
        return data[0];
    });
}

function deleteImage(filename) {
    var file = bucket.file(filename);
    file.delete().then(function(data) {
        // const apiResponse = data[0];
        // console.log("deleted " + filename);
    });
}

module.exports = { saveImages, getImage, deleteImage };