var config = require('./config.global')
config.env = 'test'
config.mongo = 'mongodb://localhost:27017/test-testplatform'
module.exports = config
