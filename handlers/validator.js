const JoiBase = require("@hapi/joi");
const JoiDate = require("@hapi/joi-date");

const Joi = JoiBase.extend(JoiDate); 

function validateRequest(req, res, next, requestSchema) {
    const validations = ['headers', 'params', 'query', 'body']
        .map(key => {
            const schema = requestSchema[key];
            const value = req[key];
            const validate = () => schema ? schema.validate(value) : Promise.resolve({});
            return validate().then(result => ({[key]: result}));
        });
    return Promise.all(validations)
        .then(result => {
            req.validated = Object.assign({},...result);
            next();
        }).catch(validationError => {  // TODO make error obj
            const message = validationError.details.map(d => d.message);
            console.log(message);
            var err = new Error(validationError);
            err.status = 400;
            throw err;
        });
};;

function validateLoginRequest(req, res, next) {
    const loginSchema = { 
        body: 
            Joi.object().keys({
                usernameOrEmail: Joi.string().required(),
                password: Joi.string().required()
        })
    };
    return validateRequest(req, res, next, loginSchema);
};

function validateRegisterRequest(req, res, next) {
    const registerSchema = { 
        body: 
            Joi.object().keys({
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

function validateCreateEntryRequest(req, res, next) {
    const entrySchema = { 
        body: 
            Joi.object().keys({
                title: Joi.string().required(),
                date: Joi.date().iso(),
                form: Joi.string().required().valid('text', 'voice', 'image'),
                text: Joi.string().empty('')
        })
    };
    return validateRequest(req, res, next, entrySchema);
}

function validateProfileRequest(req, res, next) {
    const profileUpdateSchema = { 
        body: 
            Joi.object().keys({
                gender: Joi.string(),
                mentalHealthStatus: Joi.string()
        })
    }
    return validateRequest(req, res, next, profileUpdateSchema);
};

function validateUsernameRequest(req, res, next) {
    const usernameUpdateSchema = { 
        body: 
            Joi.object().keys({
                username: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, usernameUpdateSchema);
};

function validateForgotPasswordRequest(req, res, next) {
    const forgotPasswordSchema = { 
        body: 
            Joi.object().keys({
                usernameOrEmail: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, forgotPasswordSchema);
};

function validateUpdatePasswordRequest(req, res, next) {
    const updatePasswordSchema = { 
        body: 
            Joi.object().keys({
                usernameOrEmail: Joi.string().required(),
                oldPassword: Joi.string().required(),
                newPassword: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, updatePasswordSchema);
};

function validateEmailRequest(req, res, next) {
    const updateEmailSchema = { 
        body: 
            Joi.object().keys({
                email: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, updateEmailSchema);
};

function validateVerifyEmailRequest(req, res, next) {
    const verifyEmailSchema = { 
        params: {
            token: Joi.string().required()
        }
    }
    return validateRequest(req, res, next, verifyEmailSchema);
};

function resendEmailRequest(req, res, next) {
    const resendEmailSchema = { 
        body: 
            Joi.object().keys({
                email: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, resendEmailSchema);
};

function validateEntriesRequest(req, res, next) {
    const entriesSchema = { 
        query: {
            startDate: Joi.date().format("YYYY-MM-DD"),
            endDate: Joi.date().format("YYYY-MM-DD").min(Joi.ref('startDate')),
        },
        params: {
            page: Joi.number().required()
        }        
    }
    return validateRequest(req, res, next, entriesSchema);
};

function validateEntryRequest(req, res, next) {
    const entriesSchema = { 
        params: {
            entryId: Joi.string().required()
        }        
    }
    return validateRequest(req, res, next, entriesSchema);
};

function validateEntryImageRequest(req, res, next) {
    const entrySchema = { 
        params: {
            location: Joi.string().required()
        }        
    }
    return validateRequest(req, res, next, entrySchema);
};

function validateSummaryRequest(req, res, next) {
    const summarySchema = { 
        query: {
            startDate: Joi.date().format("YYYY-MM-DD"),
            endDate: Joi.date().format("YYYY-MM-DD").min(Joi.ref('startDate')),
            sentences: Joi.number().required()
        }         
    }
    return validateRequest(req, res, next, summarySchema);
};

module.exports = { 
    validateCreateEntryRequest,
    validateSummaryRequest,
    validateEntriesRequest,
    validateVerifyEmailRequest,
    validateEntryImageRequest,
    validateLoginRequest, 
    validateRegisterRequest, 
    validateEntryRequest, 
    validateProfileRequest, 
    validateUsernameRequest,
    validateForgotPasswordRequest,
    validateUpdatePasswordRequest,
    validateEmailRequest,
    resendEmailRequest
};