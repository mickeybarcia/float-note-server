const mongoose = require('mongoose');

let setupDb = () => {
    before((next) => {             
        mongooseConnect.dbconnect() 
            .once('open', () => next())
            .on('error', err => next(err))
    })
    beforeEach((next) => {         
        const collectionName = "floatie"
        mongoose.connection.db.listCollections({ name: collectionName })
            .next((error,collection)=>{                 
                if(collection){                       
                    mongoose.connection.db.dropCollection(collectionName)    
                    .then(() => next())                                       
                    .catch(err => next(err))
                }
                else{
                    next(error)
                }
            })
    })

    after((done)=>{                
        mongoose.disconnect()
            .then(()=>done())
            .catch(err => next(err))
    })
}

module.exports = setupDb;