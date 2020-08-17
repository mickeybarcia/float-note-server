/**
 * Express app configuration that runs the server
 */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/index');
const config = require('./config');
const monitor = require('./handlers/monitor');
const db = require('./db')
const { errorHandler } = require('./handlers/error')

// initialize app
const app = express();

// body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.raw({
  type: 'image/png',
  limit: '100mb'
}));
app.use(bodyParser.urlencoded({
  extended: true
}));

// monitoring middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    if (req.route) monitor.trackRequestDuration(start, req.method, req.route.path);            
  });
  next();
});

// app views
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// app routes
app.use('/api/v1', routes);

// error handling middleware
app.use(errorHandler);

// health endpoint
app.get('/', (req, res, next) => {
  res.send("welcome to floatie!");
});

// start app
app.listen(process.env.PORT, () => console.log('floatie listening on port ' + config.app.port));

module.exports = app;