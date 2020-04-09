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
                userName: Joi.string().required(),
                password: Joi.string().required()
        })
    };
    return validateRequest(req, res, next, loginSchema);
};

function validateRegisterRequest(req, res, next) {
    const registerSchema = { 
        body: 
            Joi.object().keys({
                userName: Joi.string().required(),
                password: Joi.string().required(),
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

function validateEntryImageRequest(req, res, next) {
    const entryImageSchema = { 
        body: 
            Joi.object().keys({
                userName: Joi.string().required(),
                password: Joi.string().required()
        })
    };
    return validateRequest(req, res, next, entryImageSchema);
}

module.exports = { validateLoginRequest, validateRegisterRequest, validateEntryRequest, validateEntryImageRequest };