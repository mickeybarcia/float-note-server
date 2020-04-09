const userService = require('../services/user')
const { generateToken, checkPassword } = require('../handlers/auth')

module.exports.getCurrentUser = async (req, res, next) => {
    const user = await userService.getUserById(req.userId);
    if (!user) {
        var err = new Error('User not found');
        err.status = 404;
        throw err;
    }
    res.send(user);
}

module.exports.login = async (req, res, next) => {
    const user = await userService.getUserByUsername(req.body.userName);
    if (!user) {
        var err = new Error('Username not correct');
        err.status = 401;
        throw err;
    }
    var passwordIsValid = checkPassword(req.body.password, user.password)
    if (!passwordIsValid) {
        var err = new Error('Password not correct');
        err.status = 401;
        throw err;
    }
    res.send({ token: generateToken(user._id) });
}

module.exports.register = async (req, res, next) => {
    const user = await userService.createUser(
        req.body.userName, 
        req.body.password,
        req.body.age,
        req.body.gender,
        req.body.mentalHealthStatus).catch(function(err) {
            if (err.name == 'ValidationError') {
                var err = new Error(err);
                err.status = 422
                throw err;
            };
        });
    res.send({ token: generateToken(user._id) });
}

module.exports.registerReqSchema;
