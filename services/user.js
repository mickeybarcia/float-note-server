const User = require('../models/user');

module.exports.getUserById = (id, decrypt=true) => {
    return User.findById(id, null, { decrypt });
}

module.exports.getUserByUsername = (username) => {
    return User.findOne({ username });
}

module.exports.getUserByEmail = (email) => {
    return User.findOne({ email });
}

module.exports.createUser = (
    username, 
    email, 
    password, 
    mentalHealthStatus, 
    gender, 
    age
) => {
    return User.create({
        username: username,
        password: password,
        email: email,
        mentalHealthStatus: mentalHealthStatus,
        gender: gender,
        age, age
    });
}

module.exports.updatePassword = (user, password) => {
    return user.set({ password }).save()
}

module.exports.verify = (user) => {
    return user.set({ isVerified: true }).save()
}

module.exports.updateProfile = (user, newData) => {
    return user.set(newData).save();
}

module.exports.updateUsername = (id, username) => {
    return User.findOneAndUpdate({ _id: id }, { username });
}

module.exports.updateEmail = (id, email) => {
    return User.findOneAndUpdate({_id: id}, { email, isVerified: false });
}

module.exports.deleteUserById = (id) => {
    return User.findByIdAndRemove(id);
}