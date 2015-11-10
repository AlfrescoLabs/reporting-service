var report =  require('../reports/defects-created')
var trend =  require('../reports/defects-open')
var scurve = require('../reports/scurve')
var express = require('express')
var router = express.Router()

//Update db with data from jira
router.get('/api/alfresco/:version/defects/created/:day/:month/:year', report.updateAndDisplayDefects)
router.get('/api/alfresco/:version/defects/created', report.updateAndDisplayDefects)
/**
 * Get new defects found per day from backend
 */
router.get('/api/alfresco/:version/defects/created/summary', report.getDefects)
// Routes to defect trend
router.get('/api/alfresco/:version/defects/open/:day/:month/:year', trend.updateDefectTrend);
router.get('/api/alfresco/:version/defects/open', trend.updateDefectTrend);
router.get('/api/alfresco/:version/defects/open/summary',trend.getDefectTrend)
/**
 * Scurve for release.
 */
 router.get('/api/alfresco/:version/scurve/:run',scurve.getReport);
 router.get('/api/alfresco/:version/scurve/:sday/:smonth/:syear/:eday/:emonth/:eyear/:totalTC',scurve.getScurveProjection);
module.exports = router
