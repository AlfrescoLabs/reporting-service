var report =  require('../reports/defect-rate')
var trend =  require('../reports/defect-trend')
var express = require('express')
var router = express.Router()

router.get('/reporting/api', function(req, res) {
  res.send("Welcome to reporting");
});
//Update db with data from jira
router.get('/api/alfresco/:version/:day/:month/:year', report.updateDefects)
router.get('/api/alfresco/:version', report.updateDefects)
/**
 * Get new defects found per day from backend
 */
router.get('/api/alfresco/:version/defects', report.getDefects)
// Routes to defect trend
router.get('/api/alfresco/:version/defect/trend/:day/:month/:year', trend.updateDefectTrend);
router.get('/api/alfresco/:version/defect/trend', trend.updateDefectTrend);
router.get('/api/alfresco/:version/trend',trend.getDefectTrend)
module.exports = router
