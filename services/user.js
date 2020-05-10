const User = require('../models/user');

function getUserById(userId) {
    return User.findById(userId, { password: 0 }).exec();
}

function getUserByIdWithPassword(userId) {
    return User.findById(userId).exec();
}

function getUserByUsername(username) {
    return User.findOne({ username: username }).exec();
}

function getUserByEmail(email) {
    return User.findOne({ email: email }).exec();
}

function createUser(data) {
    return User.create(data);
}

function updatePassword(userId, password) {
    return User.findOneAndUpdate({ _id: userId }, { $set: { password: password } })
}

function verify(user) {
    return User.findOneAndUpdate({ _id: user._id }, { $set: { isVerified: true } }, { new: true })
}

function updateProfile(userId, newData) {
    return User.findOneAndUpdate({ _id: userId }, { $set: newData }, { new: true });
}

function updateUsername(userId, username) {
    return User.findOneAndUpdate({ _id: userId }, { username: username });
}

function updateEmail(userId, email) {
    return User.findOneAndUpdate({_id: userId}, {
        email: email,
        isVerified: false
    });
}

function deleteUserById(id) {
    return User.findByIdAndRemove(id).exec();
}

module.exports = { 
    getUserById, 
    getUserByIdWithPassword, 
    updatePassword, 
    verify, 
    getUserByEmail, 
    updateEmail, 
    getUserByUsername, 
    createUser, 
    updateProfile, 
    updateUsername, 
    deleteUserById 
};