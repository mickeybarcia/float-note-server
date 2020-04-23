var router = require('express').Router();
const { catchErrors } = require('../handlers/error');
const { verifyToken } = require('../handlers/auth');
const { 
    validateLoginRequest, 
    validateRegisterRequest, 
    validateCreateEntryRequest, 
    validateProfileRequest, 
    validateUsernameRequest,
    validateForgotPasswordRequest,
    validateUpdatePasswordRequest,
    validateEmailRequest,
    resendEmailRequest,
    validateSummaryRequest,
    validateEntriesRequest,
    validateEntryRequest,
    validateEntryImageRequest,
    validateVerifyEmailRequest
} = require('../handlers/validator');

var multer  = require('multer')
const upload = multer({
    storage: multer.memoryStorage(),
});

const userApi = require('./user');
const entryApi = require('./entry');
const summaryApi = require('./summary');

router.get('/', function(req, res) {
    res.send("welcome to floatie!");
});

// user API 
router.post(
    '/auth/login', 
    catchErrors(validateLoginRequest), 
    catchErrors(userApi.login)
);
router.post('/auth/register', catchErrors(validateRegisterRequest), catchErrors(userApi.register));
router.post('/auth/forgotPassword', catchErrors(validateForgotPasswordRequest), catchErrors(userApi.forgotPassword));
router.put('/auth/resetPassword', verifyToken,  catchErrors(validateUpdatePasswordRequest), catchErrors(userApi.updatePassword));

router.get('/user', verifyToken, catchErrors(userApi.getCurrentUser));
router.patch('/user', verifyToken, catchErrors(validateProfileRequest), catchErrors(userApi.updateProfile));
router.post('/user/username', verifyToken, catchErrors(validateUsernameRequest), catchErrors(userApi.validateUsername));
router.put('/user/username', verifyToken, catchErrors(validateUsernameRequest), catchErrors(userApi.updateUsername));
router.delete('/user', verifyToken, catchErrors(userApi.deleteAccount));
router.put('/user/email', verifyToken, catchErrors(validateEmailRequest), catchErrors(userApi.updateEmail));

router.get('/verify/:token', verifyToken, catchErrors(validateVerifyEmailRequest), catchErrors(userApi.verifyEmail));  // TODO rename
router.post('/verify', verifyToken, catchErrors(resendEmailRequest), catchErrors(userApi.sendVerification));

// entries API
router.post('/entries', verifyToken, catchErrors(validateCreateEntryRequest), catchErrors(entryApi.addEntry));
router.get('/entries/:page', verifyToken, catchErrors(validateEntriesRequest), catchErrors(entryApi.getEntries));
router.put('/entries/:entryId', verifyToken, catchErrors(validateEntryRequest), upload.array('page', 12), catchErrors(entryApi.editEntry)); // TODO: seperate endpoint
router.post('/entries/images', verifyToken, upload.single('page'), catchErrors(entryApi.getImageText));
router.get('/entries/:entryId', verifyToken, catchErrors(validateEntryRequest), catchErrors(entryApi.getEntry));
router.get('/entries/images/:location', verifyToken, catchErrors(validateEntryImageRequest), catchErrors(entryApi.getEntryImage));
router.delete('/entries/:entryId', verifyToken, catchErrors(validateEntryRequest), catchErrors(entryApi.deleteEntry));

// summary API
router.get('/summary', verifyToken, catchErrors(validateSummaryRequest), catchErrors(summaryApi.getSummary));

module.exports = router;