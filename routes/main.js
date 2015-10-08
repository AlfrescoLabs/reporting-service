var report =  require('../reports/defect')
var express = require('express')
var router = express.Router()

router.get('/reporting/api', function(req, res) {
  res.send("Welcome to reporting");
});

router.get('/api/alfresco/:version/:day/:month/:year', report.updateDefects)
router.get('/api/alfresco/:version', report.updateDefects)
/**
 * Get new defects found per day from backend
 */
router.get('/api/alfresco/:version/new/defects', report.getNewDefects)


module.exports = router
