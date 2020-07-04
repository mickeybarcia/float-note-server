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

/**
 * Auth API
 */
router.post(  // Authenticate user
    '/auth/login', 
    catchErrors(validateLoginRequest), 
    catchErrors(userApi.login)
);
router.post(  // Register new user
    '/auth/register', 
    catchErrors(validateRegisterRequest), 
    catchErrors(userApi.register)
);
router.post(  // Send forgot password email
    '/auth/forgotPassword', 
    catchErrors(validateForgotPasswordRequest), 
    catchErrors(userApi.sendForgotPassword)
);
router.get(  // Render reset password page
    '/auth/resetPassword/:token', 
    catchErrors(userApi.renderResetPassword)
);
router.post(  // Reset and update password
    '/auth/resetPassword/:token', 
    catchErrors(validateResetPasswordRequest),
    catchErrors(userApi.resetPassword)
);
router.get(  // Verify email page
    '/verify/:token', 
    catchErrors(userApi.verifyEmail)
);
router.post(  // Resend email verification email
    '/verify', 
    verifyToken, 
    catchErrors(userApi.sendVerification)
);

/**
 * User API
 */
router.get(  // Get current user
    '/user', 
    verifyToken, 
    catchErrors(userApi.getCurrentUser)
);
router.patch(  // Edit user profile
    '/user', 
    verifyToken,
    catchErrors(validateProfileRequest), 
    catchErrors(userApi.updateProfile)
);
router.post(  // Check is username exists
    '/user/username', 
    verifyToken, 
    catchErrors(validateUsernameRequest), 
    catchErrors(userApi.checkUsername)
);
router.put(  // Update username
    '/user/username', 
    verifyToken, 
    catchErrors(validateUsernameRequest), 
    catchErrors(userApi.updateUsername)
);
router.delete(  // Delete user
    '/user', 
    verifyToken, 
    catchErrors(userApi.deleteAccount)
);
router.put(  // Update email
    '/user/email', 
    verifyToken, 
    catchErrors(validateEmailRequest), 
    catchErrors(userApi.updateEmail
));
router.put(  // Update password
    '/user/password', 
    verifyToken,  
    catchErrors(validateUpdatePasswordRequest), 
    catchErrors(userApi.updatePassword)
);

/**
 * Entries API
 */
router.post(  // Create entry
    '/entries', 
    verifyToken, 
    catchErrors(validateCreateEntryRequest), 
    catchErrors(entryApi.addEntry)
);
router.get(  // Get entries list
    '/entries', 
    verifyToken, 
    catchErrors(validateEntriesRequest), 
    catchErrors(entryApi.getEntries)
);
router.put(  // Edit entry and/or add images
    '/entries/:entryId', 
    verifyToken, 
    upload.array('page', 12), 
    catchErrors(entryApi.editEntry)
); 
router.post(  // Get image text
    '/entries/images', 
    verifyToken, 
    upload.single('page'), 
    catchErrors(entryApi.getImageText)
);
router.get(  // Get entry
    '/entries/:entryId', 
    verifyToken, 
    catchErrors(entryApi.getEntry)
);
router.get(  // Get image
    '/entries/:entryId/images/:location', 
    verifyToken, 
    catchErrors(entryApi.getEntryImage)
);
router.delete(  // Delete entry
    '/entries/:entryId', 
    verifyToken, 
    catchErrors(entryApi.deleteEntry)
);

/**
 * Summary API
 */
router.get(  // Get entries summary
    '/summary', 
    verifyToken, 
    catchErrors(validateSummaryRequest), 
    catchErrors(summaryApi.getSummary)
);

module.exports = router;