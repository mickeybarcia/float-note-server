const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/index');
const config = require('./config');
const monitor = require('./services/monitor')
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.raw({
  type: 'image/png',
  limit: '100mb'
}));

app.use((req, res, next) => {
  const start = process.hrtime()
  res.on('finish', () => {
    if (req.route) {
      monitor.trackRequestDuration(start, req.method, req.route.path)            
    }
  })
  next()
})

app.use(express.static(__dirname + '/assets'));

app.use('/api/v1', routes);

app.use(function (err, req, res, next) {
  res.status(err.status || 500).send({'Error': err.message});
})

app.listen(process.env.PORT, () => console.log('floatie listening on port ' + config.app.port));

mongoose.connect(config.dbUrl, function (err) { 
    if (err) throw err;
});

module.exports = app;