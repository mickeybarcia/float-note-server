var router = require('express').Router();
const { catchErrors } = require('../handlers/error');
const { verifyToken } = require('../handlers/auth');
const { validateLoginRequest, validateRegisterRequest, validateEntryRequest, validateEntryImageRequest } = require('../handlers/validator');
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
router.post('/login', catchErrors(validateLoginRequest), catchErrors(userApi.login));
router.get('/me', verifyToken, catchErrors(userApi.getCurrentUser));
router.post('/register', catchErrors(validateRegisterRequest), catchErrors(userApi.register));

// entries API
router.post('/entries', verifyToken, catchErrors(validateEntryRequest), catchErrors(entryApi.addEntry));
router.get('/entries', verifyToken, catchErrors(entryApi.getEntries));
router.put('/entries/:entryId', verifyToken, upload.array('page', 12), catchErrors(entryApi.editEntry)); // TODO: seperate endpoint
router.post('/entries/images', verifyToken, upload.single('page'), catchErrors(entryApi.getImageText));
router.get('/entries/:entryId', verifyToken, catchErrors(entryApi.getEntry));
router.get('/entries/images/:location', verifyToken, catchErrors(entryApi.getEntryImage));
router.delete('/entries/:entryId', verifyToken, catchErrors(entryApi.deleteEntry));

// summary API
router.get('/summary', verifyToken, catchErrors(summaryApi.getSummary));

module.exports = router;