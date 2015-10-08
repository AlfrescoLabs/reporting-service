var report =  require('../reports/defect')
var express = require('express')
var config = require('../config')
var db = require('mongoskin').db(config.mongo)

var router = express.Router()

router.get('/reporting/api', function(req, res) {
  res.send("Welcome to reporting");
});

/**
 * Get jira item by issue id.
 */
router.get('/api/jira/:issue', function(req, res) {
  var path = jiraUrl + "/jira/rest/api/latest/issue/" + req.params.issue;
  var option = { url: path, headers }
  request(option, function jiraCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      throw err;
    }
  });
});

router.get('/api/alfresco/:version/:day/:month/:year', report);
router.get('/api/alfresco/:version', report);
/**
 * Get new defects found per day from backend
 */
router.get('/api/alfresco/:version/new/defects', function(req, res) {
  var name = req.params.version;
  db.collection('report').find({},{"date":1, "dateDisplay":1 ,"open":1}).sort({date:1}).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});
/**
 * Get status of release from db.
 */
router.get('/api/alfresco/:version/status', function(req, res) {
  var name = req.params.version;
  db.collection('report').find({}).sort({date:1}).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});

module.exports = router
