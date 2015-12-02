var config = require('./config.global')
config.env = 'prod'
config.hostname = process.env.NODE_HOST
config.mongo = process.env.NODE_MONGO
config.jira.url = process.env.JIRA_URL
config.jira.authentication = process.env.JIRA_AUTH
module.exports = config
