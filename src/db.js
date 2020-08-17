const mongoose = require('mongoose');
const config = require('./config');

if (config.env != 'test') {
  mongoose.connect(config.dbUrl, {  // TODO - make seperate module
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }, (err) => { 
      if (err) throw err;
  });
  
  process.on('SIGINT', function() {
    mongoose.connection.close(function() {
      process.exit(0);
    });
  });
}