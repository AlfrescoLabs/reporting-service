var config = require('./config.global')
config.env = 'test'
config.mongo = 'mongodb://localhost:27017/test-testplatform'
config.jira.url = process.env.JIRA_URL
config.jira.authentication = process.env.JIRA_AUTH
module.exports = config
