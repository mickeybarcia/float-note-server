const { Storage } = require('@google-cloud/storage');
const config = require('../config');

const googleCloudStorage = new Storage({ 
    projectId: config.imageStorage.projectId,
    credentials: JSON.parse(config.imageStorage.storageKey)
});
const bucket = googleCloudStorage.bucket(config.imageStorage.projectId); 

async function saveImage(file) {
    // console.log(Math.round(file.size/1024) + ' KB')
    const filename = file.url
    const blob = bucket.file(filename)
    return new Promise((resolve, reject) => {
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
}

async function getImage(filename) {
    const data = await bucket.file(filename).download();
    return data[0]
}

async function deleteImage(filename) {
    await bucket.file(filename).delete()
}

module.exports = { saveImage, getImage, deleteImage };