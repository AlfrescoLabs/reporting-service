var env = process.env.NODE_ENV || 'development'

switch (env) {
  case 'development':
  case 'test':
  case 'prod':
    config = require('./config.' + env);
    break;
  default:
    if (process.env.NODE_HOST && process.env.NODE_MONGO) {
      config = require('./config.global');
      config.hostname = process.env.NODE_HOST
      config.mongo = process.env.NODE_MONGO
    } else {
      throw new Error('Please set NODE_HOST and NODE_MONGO \nEXAMPLE: \nNODE_HOST = \'localhost\' \nNODE_MONGO = \'mongodb://localhost:27017/testplatform\'\n');
    }
}

module.exports = config;

console.log('Running in '+ env +' mode\nConnecting to ' + config.mongo + ' Database');
