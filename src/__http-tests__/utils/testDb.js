const mongoose = require('mongoose')
const config = require('../../config')
const { mochaAsync } = require('./utils')

connect = async () => {
    await mongoose.connect(config.dbUrl, {
        useNewUrlParser: true, 
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    });
    await clearDatabase()
}

closeDatabase = async () => {
    // await mongoose.connection.dropDatabase();
    await mongoose.disconnect() 
}

clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
}

module.exports.setupDB = () => {
    before(mochaAsync(async () => await connect() ));
    afterEach(mochaAsync(async () => await clearDatabase() ));
    after(mochaAsync((async () => await closeDatabase() )));
}