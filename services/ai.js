var FormData = require('form-data');
const axios = require('axios');
const config = require('../config');

const mlApiBaseUrl = config.mlApi.url;
axios.defaults.headers.common['Authorization'] = "Bearer " + config.mlApi.key;

function analyzeEntry(form, text) {
    return axios.post(mlApiBaseUrl + '/entry-text', {
        form: form, 
        text: text
    }).catch((err) => {
        throwAiError(err)
    }).then((response) => {
        return response.data;
    });
}

async function analyzeEntryFromImages(images) {
    let data = new FormData();
    for (var i = 0; i < images.length; i++) {
        data.append("page", image.buffer, {filename: images[i].url});
    }
    return axios.post(mlApiBaseUrl + '/entry-image?analyze=1', data,  {
        headers: { 
            "Content-Type": `multipart/form-data; boundary=${data._boundary}` 
        } 
    }).catch((err) => {
        throwAiError(err)
    }).then((response) => {
        return response.data;
    });
}

function getEntriesSummary(text, numSentences) {
    return axios.post(mlApiBaseUrl + '/summary', {
        numSentences: numSentences,
        text: text
    }).catch((err) => {
        throwAiError(err)
    }).then((response) => {
        return response.data;
    });
}

async function getImageText(image) {
    let formData = new FormData();
    formData.append("page", image.buffer, {filename: image.url});
    return axios.post(mlApiBaseUrl + '/entry-image', 
    formData, {
        headers: { 
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`
        }, 
    }).catch((err) => {
        throwAiError(err)
    }).then((response) => {
        return response.data;
    });
}

function throwAiError(err) {
    let message;
    if (err.response && err.response.error) {
        message = err.response.error
    } else {
        message = err.message
    }
    throw new Error('AI error: ' + message)
}

module.exports = { analyzeEntry, analyzeEntryFromImages, getEntriesSummary, getImageText };