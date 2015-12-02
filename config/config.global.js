var config = module.exports = {}
/*
 * Default env values that is overriten by development,test and production
 * configuration files. Please ensure that any property added is first added
 * here.
 */

config.hostname = 'localhost'
// JIRA
config.jira = {}
config.jira.url = 'https://issuestest.alfresco.com'
config.jira.authentication = ''
config.testlink = {}
config.testlink.url = ''
config.testlink.key = ''
