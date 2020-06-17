/**
 * Rest service for calling the AI service
 */

var FormData = require('form-data');
const axios = require('axios');
const config = require('../config');

const mlApiBaseUrl = config.mlApi.url;
axios.defaults.headers.common['Authorization'] = "Bearer " + config.mlApi.key;

/**
 * Gets an ML response for entry text
 */
module.exports.analyzeEntry = async (text) => {
    return axios.post(mlApiBaseUrl + '/entry-text', {
        text: text
    }).catch(err => {
        throwAiError(err)
    }).then(response => {
        return response.data;
    });
}

/**
 * Gets entry text from images and an ML response
 */
module.exports.analyzeEntryFromImages = async (images) => {
    let data = new FormData();
    images.forEach(image => {
        data.append("page", image.buffer, { filename: Date.now() + image.originalname });
    })
    return axios.post(mlApiBaseUrl + '/entry-image?analyze=1', data,  {
        headers: { 
            "Content-Type": `multipart/form-data; boundary=${data._boundary}` 
        } 
    }).catch(err => {
        throwAiError(err)
    }).then(response => {
        return response.data;
    });
}

/**
 * Gets a summary of a block of entry text
 * 
 * @param {String} text the text to summarize
 * @param {Number} numSentences the numbers of sentences to get back
 */
module.exports.getEntriesSummary = async (text, numSentences) => {
    return axios.post(mlApiBaseUrl + '/summary', {
        numSentences: numSentences,
        text: text
    }).catch(err => {
        throwAiError(err)
    }).then(response => {
        return response.data;
    });
}

/**
 * Gets the text of an entry image
 */
module.exports.getImageText = async (image) => {
    let formData = new FormData();
    formData.append("page", image.buffer, { filename: image.originalname });
    return axios.post(mlApiBaseUrl + '/entry-image', 
    formData, {
        headers: { 
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`
        }, 
    }).catch(err => {
        throwAiError(err)
    }).then(response => {
        return response.data;
    });
}

/**
 * Formats an error from the AI service
 * 
 * @param {Error} err the error from the AI service
 */
function throwAiError(err) {
    let message;
    if (err.response && err.response.data && err.response.data.error) {
        message = err.response.data.error
    } else {
        message = err.message
    }
    throw new Error('AI error: ' + message)
}