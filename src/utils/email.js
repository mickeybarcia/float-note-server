module.exports.isEmail = (str) => {
    return str.match(/\S+@\S+\.\S+/);
};