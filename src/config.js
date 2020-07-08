/**
 * App configurations for different environments
 */
const dotenv = require('dotenv');
dotenv.config();

const ENV = process.env.NODE_ENV;

const influx = {
    url: 'https://us-west-2-1.aws.cloud2.influxdata.com',
    token: process.env.INFLUX_TOKEN,
    org: 'c1acf5800db9c80a'
}

const imageStorage = {
    storageKey: process.env.STORAGE_KEY
}

const kms = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    dataMasterKeyId: process.env.DATA_MASTER_KEY_ID
}

const devServices = {
    kms: { ...kms },
    emailPassword: process.env.EMAIL_PASSWORD,
    testUserId: "5f00bfe620c4ca57491f6564",
    dbUrl: 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?retryWrites=true&w=majority',
    imageStorage: {
        ...imageStorage,
        projectId: "floatnote-staging"
    },
    influx: {
        ...influx,
        bucket: "floatie.ai's Bucket",
    }
}

const local = {
    ...devServices,
    env: ENV,
    app: {
        port: 8080
    },
    mlApi: {
        url: 'http://127.0.0.1:5000',
        key: process.env.ML_API_KEY
    }
};

const development = {
    ...devServices,
    env: ENV,
    app: {
        port: 8080
    },
    mlApi: {
        url: 'https://float-note-ml-api.herokuapp.com',
        key: process.env.ML_API_KEY
    }
};

var test = {...development}
test.env = 'test'
test.dbUrl = 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + '/integration?retryWrites=true&w=majority'

const production = {
    env: ENV,
    app: {
        port: 8080
    },
    kms: { ...kms },
    emailPassword: process.env.EMAIL_PASSWORD,
    dbUrl: 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?retryWrites=true&w=majority',
    mlApi: {
        url: 'https://float-note-ml-api.herokuapp.com',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        ...imageStorage,
        projectId: "floatie.appspot.com"
    },
    influx: {
        ...influx,
        bucket: "floatie-prod"
    }
};

const staging = {...production}
staging.env = 'staging'

const config = {
    local,
    development,
    test,
    staging,
    production
};

module.exports = config[ENV];