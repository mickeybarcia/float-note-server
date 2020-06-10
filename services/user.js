const User = require('../models/user');

module.exports.getUserById = (userId) => {
    return User.findById(userId, { password: 0 });
}

module.exports.getUserByIdWithPassword = (userId) => {
    return User.findById(userId);
}

module.exports.getUserByUsername = (username) => {
    return User.findOne({ username: username });
}

module.exports.getUserByEmail = (email) => {
    return User.findOne({ email: email });
}

module.exports.createUser = (
    username, 
    email, 
    encryptedDataKey, 
    password, 
    mentalHealthStatus, 
    gender, 
    age
) => {
    return User.create({
        username: username,
        password: password,
        email: email,
        encryptedDataKey: encryptedDataKey,
        mentalHealthStatus: mentalHealthStatus,
        gender: gender,
        age, age
    });
}

module.exports.updatePassword = (userId, password) => {
    return User.findOneAndUpdate({ _id: userId }, { $set: { password: password } })
}

module.exports.verify = (user) => {
    return User.findOneAndUpdate(
        { _id: user._id },
        { $set: { isVerified: true } }, 
        { new: true }
    )
}

module.exports.updateProfile = (userId, newData) => {
    return User.findOneAndUpdate({ _id: userId }, { $set: newData }, { new: true });
}

module.exports.updateUsername = (userId, username) => {
    return User.findOneAndUpdate({ _id: userId }, { username: username });
}

module.exports.updateEmail = (userId, email) => {
    return User.findOneAndUpdate({_id: userId}, {
        email: email,
        isVerified: false
    });
}

module.exports.deleteUserById = (id) => {
    return User.findByIdAndRemove(id);
}