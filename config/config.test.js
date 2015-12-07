var config = require('./config.global')
config.env = 'test'
config.mongo = 'mongodb://localhost:27017/test-testplatform'
config.jira.url = 'https://issuestest.alfresco.com'
module.exports = config
