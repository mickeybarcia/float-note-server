/**
 * App configurations for different environments
 */

const dotenv = require('dotenv');
dotenv.config();

const ENV = process.env.NODE_ENV;

const local = {
    env: ENV,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    emailPassword: process.env.EMAIL_PASSWORD,
    testUserId: "5f00bfe620c4ca57491f6564",
    dbUrl: 'mongodb://app-user:' + process.env.DB_PASSWORD + '@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/test?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority',
    mlApi: {
        url:  'http://127.0.0.1:5000',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatnote-staging",
        storageKey: process.env.STORAGE_KEY
    },
    kms: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        masterkeyId: 'fedba5d0-8dd1-4126-a07e-adf85aec2e0f'
    },
    influx: {
        url: 'https://us-west-2-1.aws.cloud2.influxdata.com',
        token: process.env.INFLUX_TOKEN,
        bucket: "floatie.ai's Bucket",
        org: 'c1acf5800db9c80a',
    }
};

const development = {
    env: ENV,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    emailPassword: process.env.EMAIL_PASSWORD,
    testUserId: "5f00bfe620c4ca57491f6564",
    dbUrl: 'mongodb://app-user:' + process.env.DB_PASSWORD + '@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/test?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority',
    mlApi: {
        url: 'https://float-note-ml-api.herokuapp.com',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatnote-staging",
        storageKey: process.env.STORAGE_KEY
    },
    kms: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        masterkeyId: process.env.MASTER_KEY_ID
    },
    influx: {
        url: 'https://us-west-2-1.aws.cloud2.influxdata.com',
        token: process.env.INFLUX_TOKEN,
        bucket: "floatie.ai's Bucket",
        org: 'c1acf5800db9c80a',
    }
};

var test = {...development}
test.env = 'test'
test.dbUrl = 'mongodb://app-user:' + process.env.DB_PASSWORD + '@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/integration?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority'

const production = {
    env: ENV,
    app: {
        port: 8080
    },
    tokenSecret: process.env.TOKEN_SECRET,
    emailPassword: process.env.EMAIL_PASSWORD,
    dbUrl: 'mongodb://app-user:' + process.env.DB_PASSWORD + '@floatie-shard-00-00-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-01-rt9ey.gcp.mongodb.net:27017,floatie-shard-00-02-rt9ey.gcp.mongodb.net:27017/test?ssl=true&replicaSet=floatie-shard-0&authSource=admin&retryWrites=true&w=majority',
    mlApi: {
        url: 'https://float-note-ml-api.herokuapp.com',
        key: process.env.ML_API_KEY
    },
    imageStorage: {
        projectId: "floatie.appspot.com",
        storageKey: process.env.STORAGE_KEY
    },
    kms: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        masterkeyId: process.env.MASTER_KEY_ID
    },
    influx: {
        url: 'https://us-west-2-1.aws.cloud2.influxdata.com',
        token: process.env.INFLUX_TOKEN,
        bucket: "floatie.ai's Bucket",
        org: 'c1acf5800db9c80a',
    }
};

const config = {
    local,
    development,
    test,
    production
};

module.exports = config[ENV];