var config = require('./config.global')
config.env = 'test'
config.mongo = 'mongodb://localhost:27017/test-testplatform'
config.jira.url = ' https://issuestest.alfresco.com'
config.jira.authentication = process.env.JIRA_AUTH
module.exports = config
