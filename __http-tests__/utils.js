const mongoose = require('mongoose');

// TODO put db connection in seperate file

const TEST_URL = "mongodb://localhost:27017/floatie"

let setupDb = () => {
    before((done) => {   
        const connection = mongoose.connect(TEST_URL, {
            useNewUrlParser: true, 
            useCreateIndex: true,
            useUnifiedTopology: true
        });           
        connection
            .once('open', () => done())
            .on('error', error => done(error))
    })
    beforeEach((done)=> {   
        mongoose.connection.db.listCollections({name: "floatie" })
            .next((error, collection) => {                 
                if (collection) {                        
                    mongoose.connection.db.dropCollection(collection)    
                    .then(() => done())                                       
                    .catch(err => done(err))
                }
                else {
                    done(error)
                }
            })
    })
    after((done) => {                       
        mongoose.disconnect()
            .then(() => done())
            .catch(err => done(err))
    })
}

module.exports = setupDb;