var report =  require('../reports/defects-created')
var trend =  require('../reports/defects-open')
var express = require('express')
var router = express.Router()

//Update db with data from jira
router.get('/api/alfresco/:version/defects/created/:day/:month/:year', report.updateDefects)
router.get('/api/alfresco/:version/defects/created', report.updateDefects)
/**
 * Get new defects found per day from backend
 */
router.get('/api/alfresco/:version/defects/created/summary', report.getDefects)
// Routes to defect trend
router.get('/api/alfresco/:version/defects/open/:day/:month/:year', trend.updateDefectTrend);
router.get('/api/alfresco/:version/defects/open', trend.updateDefectTrend);
router.get('/api/alfresco/:version/defects/open/summary',trend.getDefectTrend)

//Cron jobs
var CronJob = require('cron').CronJob;
new CronJob('* * 23 * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');
module.exports = router
