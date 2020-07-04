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
 * 
 * @param {String} text the text to analyze
 */
module.exports.analyzeEntry = async (text) => {
    try {
        const response = await axios.post(mlApiBaseUrl + '/entry-text', { text })
        return response.data
    } catch (err) {
        throw new Error('Unable to analyze text: ' + getAiErrorMessage(err))
    }  
}

/**
 * Gets entry text from images and an ML response
 * 
 * @param {*} images the images to analyze
 */
module.exports.analyzeEntryFromImages = async (images) => {
    let data = new FormData();
    images.forEach(image => {
        data.append("page", image.buffer, { filename: Date.now() + image.originalname });
    })
    try {
        const response = await axios.post(
            mlApiBaseUrl + '/entry-image?analyze=1', 
            data, 
            { headers: getFormDataHeader(data) }
        )
        return response.data
    } catch (err) {
        throw new Error('Unable to analyze entry from image: ' + getAiErrorMessage(err))
    }
}

/**
 * Gets a summary of a block of entry text
 * 
 * @param {String} text the text to summarize
 * @param {Number} numSentences the numbers of sentences to get back
 */
module.exports.getEntriesSummary = async (text, numSentences) => {
    try {
        const response = await axios.post(mlApiBaseUrl + '/summary', { text, numSentences })
        return response.data
    } catch (err) {
        throw new Error('Unable to generate summary: ' + getAiErrorMessage(err))
    }  
}

/**
 * Gets entry text from and image
 * 
 * @param {*} image the image to analyze
 */
module.exports.getImageText = async (image) => {
    let data = new FormData();
    data.append("page", image.buffer, { filename: image.originalname });
    try {
        const response = await axios.post(
            mlApiBaseUrl + '/entry-image', 
            data, 
            { headers: getFormDataHeader(data) }
        )
        return response.data
    } catch (err) {
        throw new Error('Unable to get image text: ' + getAiErrorMessage(err))
    }
}

/**
 * Formats an error message from the AI service
 * 
 * @param {Error} err the error from the AI service
 */
function getAiErrorMessage(err) {
    if (err.response && err.response.data && err.response.data.error) {
        return err.response.data.error
    } else {
        return err.message
    }
}

/**
 * Formats form data header
 * 
 * @param {FormData} data 
 */
function getFormDataHeader(data) {
    return { "Content-Type": `multipart/form-data; boundary=${data._boundary}` }
}