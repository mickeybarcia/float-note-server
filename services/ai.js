const config = require('../config');
var FormData = require('form-data');
const storageService = require('./storage');
const mlApiKey = config.mlApi.key;
const mlApiBaseUrl = config.mlApi.url;

const axios = require('axios');
axios.defaults.headers.common['Authorization'] = "Bearer " + mlApiKey;

function analyzeEntry(form, text) {
    return axios.post(mlApiBaseUrl + '/entry-text', {
        form: form, 
        text: text
    }).catch((err) => {
        let message;
        if (err.response && err.response.error) {
            message = err.response.error
        } else {
            message = err.message
        }
        throw new Error('AI error: ' + message)
    }).then((response) => {
        return response.data;
    });
}

async function analyzeEntryFromImages(images) {
    let data = new FormData();
    for (var i = 0; i < images.length; i++) {
        const page = await storageService.getImage(images[i].url);
        data.append("page", page, {filename: images[i].url});
    }
    return axios.post(mlApiBaseUrl + '/entry-image?analyze=1', data,  {
        headers: { 
            "Content-Type": `multipart/form-data; boundary=${data._boundary}` 
        } 
    }).catch((err) => {
        let message;
        if (err.response && err.response.error) {
            message = err.response.error
        } else {
            message = err.message
        }
        throw new Error('AI error: ' + message)
    }).then((response) => {
        return response.data;
    });
}

function getEntriesSummary(text, numSentences) {
    return axios.post(mlApiBaseUrl + '/summary', {
        numSentences: numSentences,
        text: text
    }).catch((err) => {
        let message;
        if (err.response && err.response.error) {
            message = err.response.error
        } else {
            message = err.message
        }
        throw new Error('AI error: ' + message)
    }).then((response) => {
        return response.data;
    });
}

async function getImageText(image) {
    const page = await storageService.getImage(image.url);
    let data = new FormData();
    data.append("page", page, {filename: image.url});
    return axios.post(mlApiBaseUrl + '/entry-image', data, {
        headers: { 
            "Content-Type": `multipart/form-data; boundary=${data._boundary}` 
        }, 
        maxContentLength: 100 * 1024 * 1024
    }).catch((err) => {
        let message;
        if (err.response && err.response.error) {
            message = err.response.error
        } else {
            message = err.message
        }
        throw new Error('AI error: ' + message)
    }).then((response) => {
        return response.data;
    });
}

module.exports = { analyzeEntry, analyzeEntryFromImages, getEntriesSummary, getImageText };