var config = require('./config.global')
config.env = 'development'
config.mongo = process.env.NODE_MONGO || 'mongodb://localhost:27017/testplatform'
config.jira.url = process.env.JIRA_URL || 'https://issuestest.alfresco.com'
config.jira.authentication = process.env.JIRA_AUTH || ''
module.exports = config
