var config = require('./config.global')
config.env = 'development'
config.mongo = process.env.NODE_MONGO || 'mongodb://localhost:27017/testplatform'
module.exports = config
