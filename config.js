const dotenv = require('dotenv');
dotenv.config();
const env = process.env.NODE_ENV;

const local = {
    env: env,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    diarySecret: process.env.DIARY_SECRET,
    emailPassword: process.env.EMAIL_PASSWORD,
    testUserId: "5e7fd467745d730aabf7ece6",
    dbUrl: 'mongodb://floatie:gFEbDuEAsEU8Lp71@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/test?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority',
    mlApi: {
        url: 'http://127.0.0.1:5000',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatie.appspot.com",
        storageKey: process.env.STORAGE_KEY
    }
};

const development = {
    env: env,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    diarySecret: process.env.DIARY_SECRET,
    emailPassword: process.env.EMAIL_PASSWORD,
    testUserId: "5e7fd467745d730aabf7ece6",
    dbUrl: 'mongodb://floatie:gFEbDuEAsEU8Lp71@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/test?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority',
    mlApi: {
        url: 'https://float-note-ml-api.herokuapp.com',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatie.appspot.com",
        storageKey: process.env.STORAGE_KEY
    }
};

const production = {
    env: env,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    diarySecret: process.env.DIARY_SECRET,
    emailPassword: process.env.EMAIL_PASSWORD,
    dbUrl: 'mongodb://floatie:gFEbDuEAsEU8Lp71@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/test?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority',
    mlApi: {
        url: 'https://float-note-ml-api.herokuapp.com',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatie.appspot.com",
        storageKey: process.env.STORAGE_KEY
    }
};

const config = {
    local,
    development,
    production
};

module.exports = config[env];