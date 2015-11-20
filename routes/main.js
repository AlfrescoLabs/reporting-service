
var testruns =  require('../reports/testruns')
var report =  require('../reports/defects-created')
var trend =  require('../reports/defects-open')
var scurve = require('../reports/scurve')
var express = require('express')
var router = express.Router()

//Update db with data from jira
router.get('/api/:product/:version/defects/created/:day/:month/:year', report.updateAndDisplayDefects)
router.get('/api/:product/:version/defects/created', report.updateAndDisplayDefects)
/**
 * Get new defects found per day from backend
 */
router.get('/api/alfresco/:version/defects/created/summary', report.getDefects)

/**
 * Routes to defect trend
 */
router.get('/api/:product/:version/defects/open/:day/:month/:year', trend.updateDefectTrend)
router.get('/api/:product/:version/defects/open', trend.updateDefectTrend);
router.get('/api/:product/:version/defects/open/summary/csv', trend.getDefectsCSV)
router.get('/api/:product/:version/defects/open/summary',trend.getDefectTrend)
/**
 * Scurve data per test run.
 */
router.get('/api/:product/:version/scurve/:sday/:smonth/:syear/:eday/:emonth/:eyear/:totalTC', scurve.getScurveProjection)

router.post('/api/:product/:version/:run/scurve', scurve.create)

/**
 * Create Test Run.
 */
 router.get('/api/:product/testrun/:name/start', testruns.start)
 router.get('/api/:product/testrun/:name/stop', testruns.stop)
 router.put('/api/:product/testrun/:name', testruns.addEntry)
 router.get('/api/:product/testrun/:name',testruns.get)
 router.delete('/api/:product/testrun/:name',testruns.delete)
 router.post('/api/:product/testrun/', testruns.create)
 router.put('/api/:product/testrun', testruns.update)
 router.get('/api/:product/testrun/:name/burndown', testruns.getBurnDownReport)
module.exports = router
