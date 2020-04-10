const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/index');
const config = require('./config');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.raw({
  type: 'image/png',
  limit: '100mb'
}));
app.use('/', routes);

app.use(function (err, req, res, next) {
  res.status(err.status || 500).send({'Error': err.message});
})

app.listen(config.app.port, () => console.log('floatie listening on port ' + config.app.port));

mongoose.connect(config.dbUrl, function (err) { 
    if (err) throw err;
});

module.exports = app;