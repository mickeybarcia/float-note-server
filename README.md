# float-note-server
### the node backend API for [float note](https://github.com/mickeybarcia/floatnote)
## tools used
- Node Express
- Heroku deployment
- Mongodb and mongoose for the database
- Amazon KMS for data encryption keys
- Google Cloud bucket storage for journal entry images
- InfluxDB monitoring
- JWT auth
- Joi request validation
- chai, supertest, jest for tests
## run locally
```
# get .env for development environment
npm install
npm start
```
## resources
- https://www.freecodecamp.org/news/securing-node-js-restful-apis-with-json-web-tokens-9f811a92bb52/
- https://codeburst.io/node-express-async-code-and-error-handling-121b1f0e44ba
- https://www.terlici.com/2014/08/25/best-practices-express-structure.html
- https://medium.com/@danielsternlicht/caching-like-a-boss-in-nodejs-9bccbbc71b9b
- https://ipirozhenko.com/blog/measuring-requests-duration-nodejs-express/
- https://github.com/animir/node-rate-limiter-flexible/wiki/Overall-example#login-endpoint-protection
