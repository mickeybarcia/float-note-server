const userRoute = require('../routes/user')
const userService = require('../services/user')
const keyService = require('../services/key') 
const dataUtil = require('../util/data')

jest.mock('../services/user');
jest.mock('../services/key');
jest.mock('../util/data');

describe('register', () => {
  it('creates a user and sends an auth token', async () => {
    
  });
});
