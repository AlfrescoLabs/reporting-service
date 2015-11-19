
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
router.get('/api/:product/:version/:run/burndown', scurve.getReport)
router.post('/api/:product/:version/:run/scurve', scurve.create)

/**
 * Create Test Run.
 */
 router.get('/api/:product/testruns/:name/start', testruns.start)
 router.get('/api/:product/testruns/:name/stop', testruns.stop)
 router.put('/api/:product/testruns/:name', testruns.addEntry)
 router.get('/api/:product/testruns/:name',testruns.get)
 router.delete('/api/:product/testruns/:name',testruns.delete)
 router.post('/api/:product/testruns/', testruns.create)
 router.put('/api/:product/testruns', testruns.update)

module.exports = router
