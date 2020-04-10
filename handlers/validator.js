const Joi = require('joi');

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
        }).catch(validationError => {
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

function validateEntryRequest(req, res, next) {
    const entrySchema = { 
        body: 
            Joi.object().keys({
                title: Joi.string().required(),
                date: Joi.string(),
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

function resendEmailRequest(req, res, next) {
    const resendEmailSchema = { 
        body: 
            Joi.object().keys({
                email: Joi.string().required()
        })
    }
    return validateRequest(req, res, next, resendEmailSchema);
};

module.exports = { 
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