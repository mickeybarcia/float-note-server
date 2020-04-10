const dotenv = require('dotenv');
dotenv.config();
const env = process.env.NODE_ENV;

const local = {
    env: env,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    testUserId: "5b776d3a30c51e3b27b5f814",
    dbUrl: 'mongodb://localhost:27020/floatie',
    mlApi: {
        url: 'http://127.0.0.1:5000',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatie.appspot.com",
        keyFilename: "float-note-server/floatie-4d5f1a0743b4.json"
    }
};

const development = {
    env: env,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    testUserId: "5cf54b2f3608b500120ba751",
    dbUrl: 'mongodb://floatie:gFEbDuEAsEU8Lp71@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/test?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority',
    mlApi: {
        //url: 'https://float-note-ml-api.herokuapp.com',
        url: 'http://127.0.0.1:5000',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatie.appspot.com",
        keyFilename: "float-note-server/floatie-4d5f1a0743b4.json"
    }
};

const production = {
    env: env,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    dbUrl: 'mongodb://floatie:gFEbDuEAsEU8Lp71@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/test?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority',
    mlApi: {
        url: 'https://float-note-ml-api.herokuapp.com',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatie.appspot.com",
        keyFilename: "floatie-4d5f1a0743b4.json"
    }
};

const config = {
    local,
    development,
    production
};

module.exports = config[env];