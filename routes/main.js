
var testruns =  require('../reports/testruns')
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
router.get('/api/alfresco/:version/defects/open/:day/:month/:year', trend.updateDefectTrend)
router.get('/api/alfresco/:version/defects/open', trend.updateDefectTrend);
router.get('/api/alfresco/:version/defects/open/summary/csv', trend.getDefectsCSV)
router.get('/api/alfresco/:version/defects/open/summary',trend.getDefectTrend)
/**
 * Scurve data per produc and test run.
 */
router.get('/api/alfresco/:version/scurve/:sday/:smonth/:syear/:eday/:emonth/:eyear/:totalTC', scurve.getScurveProjection)
router.get('/api/alfresco/:version/:run/scurve', scurve.getReport)
router.post('/api/alfresco/:version/:run/scurve', scurve.create)

/**
 * Create Test Run.
 */
 router.put('/api/testruns/:name', testruns.addEntry)
 router.get('/api/testruns/:name',testruns.get)
 router.delete('/api/testruns/:name',testruns.delete)
 router.post('/api/testruns/', testruns.create)
 router.put('/api/testruns', testruns.update)

module.exports = router
