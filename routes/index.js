const multer  = require('multer')
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
    validateSummaryRequest,
    validateEntriesRequest,
    validateResetPasswordRequest
} = require('../handlers/validator');
const userApi = require('./user');
const entryApi = require('./entry');
const summaryApi = require('./summary');

var router = require('express').Router();

const upload = multer({
    storage: multer.memoryStorage(),
});

// TODO - split up

// user API 
router.post(
    '/auth/login', 
    catchErrors(validateLoginRequest), 
    catchErrors(userApi.login)
);
router.post(
    '/auth/register', 
    catchErrors(validateRegisterRequest), 
    catchErrors(userApi.register)
);
router.post(
    '/auth/forgotPassword', 
    catchErrors(validateForgotPasswordRequest), 
    catchErrors(userApi.sendForgotPassword)
);
router.get( 
    '/auth/resetPassword/:token', 
    catchErrors(userApi.renderResetPassword)
);
router.post(
    '/auth/resetPassword/:token', 
    catchErrors(validateResetPasswordRequest),
    catchErrors(userApi.resetPassword)
);
router.put(
    '/user/password', 
    verifyToken,  
    catchErrors(validateUpdatePasswordRequest), 
    catchErrors(userApi.updatePassword)
);

router.get(
    '/user', 
    verifyToken, 
    catchErrors(userApi.getCurrentUser)
);
router.patch(
    '/user', 
    verifyToken,
    catchErrors(validateProfileRequest), 
    catchErrors(userApi.updateProfile)
);
router.post(
    '/user/username', 
    verifyToken, 
    catchErrors(validateUsernameRequest), 
    catchErrors(userApi.checkUsername)
);
router.put(
    '/user/username', 
    verifyToken, 
    catchErrors(validateUsernameRequest), 
    catchErrors(userApi.updateUsername)
);
router.delete(
    '/user', 
    verifyToken, 
    catchErrors(userApi.deleteAccount)
);
router.put(
    '/user/email', 
    verifyToken, 
    catchErrors(validateEmailRequest), 
    catchErrors(userApi.updateEmail
));

router.get(
    '/verify/:token', 
    verifyToken, 
    catchErrors(userApi.verifyEmail)
);
router.post(
    '/verify', 
    verifyToken, 
    catchErrors(userApi.sendVerification)
);

// entries API
router.post(
    '/entries', 
    verifyToken, 
    catchErrors(validateCreateEntryRequest), 
    catchErrors(entryApi.addEntry)
);
router.get(
    '/entries', 
    verifyToken, 
    catchErrors(validateEntriesRequest), 
    catchErrors(entryApi.getEntries)
);
router.put(
    '/entries/:entryId', 
    verifyToken, 
    upload.array('page', 12), 
    catchErrors(entryApi.editEntry)
); // TODO: seperate endpoint
router.post(
    '/entries/images', 
    verifyToken, 
    upload.single('page'), 
    catchErrors(entryApi.getImageText)
);
router.get(
    '/entries/:entryId', 
    verifyToken, 
    catchErrors(entryApi.getEntry)
);
router.get(
    '/entries/:entryId/images/:location', 
    verifyToken, 
    catchErrors(entryApi.getEntryImage)
);
router.delete(
    '/entries/:entryId', 
    verifyToken, 
    catchErrors(entryApi.deleteEntry)
);

// summary API
router.get(
    '/summary', 
    verifyToken, 
    catchErrors(validateSummaryRequest), 
    catchErrors(summaryApi.getSummary)
);

module.exports = router;