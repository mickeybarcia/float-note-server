const User = require('../models/user');


function getUserById(userId) {
    return User.findById(userId, { password: 0 }).exec();
}

function getUserByUsername(username) {
    return User.findOne({ userName: username }).exec();
}

function createUser(username, password, age, gender, status) {
    return User.create({
        userName: username,
        age: age,
        gender: gender,
        mentalHealthStatus: status,
        password: password
    });
}

module.exports = { getUserById, getUserByUsername, createUser };