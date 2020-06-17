/**
 * Request validation middleware
 */

const JoiBase = require("@hapi/joi");
const JoiDate = require("@hapi/joi-date");
const BadRequestError = require('../error/badRequestError')

const Joi = JoiBase.extend(JoiDate); 

/**
 * Validates the request based on the schema for the endpoint
 */
async function validateRequest(req, res, next, requestSchema) {
    const validations = ['headers', 'params', 'query', 'body']
        .map(key => {
            const schema = requestSchema[key];
            const value = req[key];
            const validate = () => schema ? schema.validateAsync(value) : Promise.resolve({});
            return validate().then(result => ({[key]: result}));
        });
    return Promise.all(validations)
        .then(result => {
            req.validated = Object.assign({},...result);
            next();
        }).catch(validationError => {
            const message = validationError.details.map(d => d.message);
            throw new BadRequestError(message);
        });
};

module.exports.validateLoginRequest = (req, res, next) => {
    const loginSchema = { 
        body: Joi.object().keys({
            usernameOrEmail: Joi.string().required(),
            password: Joi.string().required()
        })
    };
    return validateRequest(req, res, next, loginSchema);
};

module.exports.validateRegisterRequest = (req, res, next) => {
    const registerSchema = { 
        body: Joi.object().keys({
            username: Joi.string().required(),
            password: Joi.string().required(),
            email: Joi.string().regex(/\S+@\S+\.\S+/).required(),
            age: Joi.number().required(),
            gender: Joi.string(),
            mentalHealthStatus: Joi.string()
        })
    }
    return validateRequest(req, res, next, registerSchema);
};

module.exports.validateCreateEntryRequest = (req, res, next) => {
    const entrySchema = { 
        body: Joi.object().keys({
            title: Joi.string().required(),
            date: Joi.date().iso(),
            form: Joi.string().required().valid('text', 'voice', 'image'),
            text: Joi.string().empty('')
        })
    };
    return validateRequest(req, res, next, entrySchema);
}

module.exports.validateProfileRequest = (req, res, next) => {
    const profileUpdateSchema = { 
        body: Joi.object().keys({
            gender: Joi.string(),
            mentalHealthStatus: Joi.string()
        })
    }
    return validateRequest(req, res, next, profileUpdateSchema);
};

module.exports.validateUsernameRequest = (req, res, next) => {
    const usernameUpdateSchema = { 
        body: Joi.object().keys({
            username: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, usernameUpdateSchema);
};

module.exports.validateForgotPasswordRequest = (req, res, next) => {
    const forgotPasswordSchema = { 
        body: Joi.object().keys({
            usernameOrEmail: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, forgotPasswordSchema);
};

module.exports.validateUpdatePasswordRequest = (req, res, next) => {
    const updatePasswordSchema = { 
        body: Joi.object().keys({
            usernameOrEmail: Joi.string().required(),
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, updatePasswordSchema);
};

module.exports.validateEmailRequest = (req, res, next) => {
    const updateEmailSchema = { 
        body: Joi.object().keys({
            email: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, updateEmailSchema);
};

module.exports.validateVerifyEmailRequest = (req, res, next) => {
    const verifyEmailSchema = { 
        params: Joi.object().keys({
            token: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, verifyEmailSchema);
};

module.exports.resendEmailRequest = (req, res, next) => {
    const resendEmailSchema = { 
        body: Joi.object().keys({
            email: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, resendEmailSchema);
};

module.exports.validateEntriesRequest = (req, res, next) => {
    const entriesSchema = { 
        query: Joi.object().keys({
            startDate: Joi.date().format("YYYY-MM-DD"),
            endDate: Joi.date().format("YYYY-MM-DD").min(Joi.ref('startDate')),
            page: Joi.number()
        })
    }
    return validateRequest(req, res, next, entriesSchema);
};

module.exports.validateEntryRequest = (req, res, next) => {
    const entriesSchema = { 
        params: Joi.object().keys({
            entryId: Joi.string().required()
        })        
    }
    return validateRequest(req, res, next, entriesSchema);
};

module.exports.validateEntryImageRequest = (req, res, next) => {
    const entrySchema = { 
        params: Joi.object().keys({
            location: Joi.string().required(),
            entryId: Joi.string().required()
        })        
    }
    return validateRequest(req, res, next, entrySchema);
};

module.exports.validateSummaryRequest = (req, res, next) => {
    const summarySchema = { 
        query: Joi.object().keys({
            startDate: Joi.date().format("YYYY-MM-DD").required(),
            endDate: Joi.date().format("YYYY-MM-DD").min(Joi.ref('startDate')).required(),
            sentences: Joi.number().required()
        })         
    }
    return validateRequest(req, res, next, summarySchema);
};