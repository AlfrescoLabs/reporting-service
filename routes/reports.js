var express = require('express');
var request = require('request'); //http request
var db = require('mongoskin').db('mongodb://localhost:27017/testplatform');
var router = express.Router();
var async = require('async'); //async lib
var jiraUrl = 'https://issues.alfresco.com';
var searchApiPath = '/jira/rest/api/2/search?jql=';
var headers = { "Authorization" : "Basic bXN1enVraTpuQkd4aTU4NA==" };

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

router.get('/api/alfresco/:version', processQuery);
/**
 * Get open bug list using alfresco release query.
 * Result is streamed back as json object.
 */
function processQuery(req, res) {
  var version = req.params.version;
  var today = new Date();
  //The data model
  var json = {
    date: today,
    dateDisplay: today.getDate() + '/' + (today.getMonth()+1) + '/' + today.getFullYear(),
    open: {
      count: 0,
      critical: 0,
      blocker: 0,
      issues: []
    },
    close: {
      count: 0,
      critical: 0,
      blocker: 0,
      issues: []
    }
  };
  //http request

  async.parallel([
      /**
       * Get open bugs and populate json object.
       */
      function getOpenBugs(callback) {
        var today = new Date();
        var parsedDate = today.getFullYear() + "-" + (new Number(today.getMonth()) + 1) + "-" + today.getDate();
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        var parsedTomorrow = tomorrow.getFullYear() + "-" + (new Number(tomorrow.getMonth()) + 1) + "-" + tomorrow.getDate();

        var filter = "project = ace " +
          "AND (fixVersion = " + version + " OR affectedVersion = " + version + ") " +
          "AND priority in (blocker, critical) AND type in (bug)" +
          "AND created >= " + parsedDate + " AND created <= " + parsedTomorrow +
          " ORDER BY created DESC";

        var path = jiraUrl + searchApiPath + filter;
        var option = { url: path, headers }

        //Query jira for open bugs
        request(option, function(err, response, body) {
          // JSON body
          if (err) {
            console.log(err);
            callback(true);
            return;
          }
          var data = JSON.parse(body);
          json.open.count = data.total;
          var issues = data.issues;
          if(issues === 'undefined'){
            callback(true);
          }

          callback(false);
        });
      },

      /**
       * Get closed bugs and populate json object.
       */
      function getCloseBugs(callback) {
        var filter = "project = ace AND status in (closed, verified)" +
          "AND (fixVersion = " + version + " OR affectedVersion = " + version + ") " +
          "AND priority in (blocker, critical) AND type in (bug)" +
          // "AND created >= " + " AND created <= "
          + "ORDER BY created DESC";
        var path = jiraUrl + searchApiPath + filter;
        //Query jira for open bugs
        request(path, function(err, response, body) {
          if (err) {
            console.log(err);
            callback(true);
            return;
          }
          var data = JSON.parse(body);
          json.close.count = data.total;

          if(issues === undefined){
            callback(true);
            return;
          }
          var issues = data.issues;

          issues.map(function(issue) {
            var item = {
              id: issue.key,
              link: issue.self,
              type: issue.fields.priority.name
            };
            if (item.type === 'Blocker') {
              json.close.blocker++;
            }
            if (item.type === 'Critical') {
              json.close.critical++;
            }
            json.close.issues.push(item);
          });
          callback(false);
        });
      }
    ],
    /*
     * Send collated result
     */

    function display(err, results) {
      if (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      //store it to mongodb
      report = db.collection('report');
      report.update({
        date: json.date
      }, json, {
        upsert: true
      }, function(err, result) {
        if (err) {
          console.log('DB error: ' + err);
          res.status(500).send('DB error');
        }
        if (result) {
          console.log('Added record');
          res.send(json)
        }
      });
    }
  )
}
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

/**
 * Display graph.
 */
router.get('/api/alfresco/:version/graph', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

module.exports = router;
