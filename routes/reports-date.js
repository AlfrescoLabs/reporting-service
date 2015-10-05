var express = require('express');
var request = require('request'); //http request
var db = require('mongoskin').db('mongodb://localhost:27017/testplatform');
var router = express.Router();
var async = require('async'); //async lib
var jiraUrl = 'https://issues.alfresco.com';
var searchApiPath = '/jira/rest/api/2/search?jql=';

router.get('/api/alfresco/:version/:day/:month/:year', processQuery);
/**
 * Get open bug list using alfresco release query.
 * Result is streamed back as json object.
 */
function processQuery(req, res) {
  var version = req.params.version;
  var day = req.params.day;
  var month = req.params.month;
  var year = req.params.year;
  var targetDate = new Date(year,month -1, day, 0,0,0,0);
  var parsedDate = year + "-" + month + "-" + day;
  var tomorrow = new Date(targetDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  console.log(tomorrow)
  var parsedTomorrow = tomorrow.getFullYear() + "-" + (new Number(tomorrow.getMonth())+1) + "-" + tomorrow.getDate();
  var json = {
    date: targetDate.getTime(),
    dateDisplay: day + '/' + month + '/' + year,
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

  async.parallel([
      /**
       * Get open bugs and populate json object.
       */
      function getOpenBugs(callback) {

        var filter = "project = ace " + //AND status not in (closed, verified)" +
          "AND (fixVersion = " + version + " OR affectedVersion = " + version + ") " +
          "AND priority in (blocker, critical) AND type in (bug) " +
          "AND CREATED >= " + parsedDate + " AND CREATED <= " + parsedTomorrow
          + " ORDER BY created DESC";
        var path = jiraUrl + searchApiPath + filter;
        var option = {
          url: path,
          headers : {
                  'Authorization' : 'Basic bXN1enVraTpuQkd4aTU4NA=='
              }
        }
        console.log(option)
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
          issues.map(function(issue) {
            var item = {
              id: issue.key,
              link: issue.self,
              type: issue.fields.priority.name
            };
            if (item.type === 'Blocker') {
              json.open.blocker++;
            }
            if (item.type === 'Critical') {
              json.open.critical++;
            }
            json.open.issues.push(item);
            1
          });
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
          "AND (updated> " + parsedDate + ") ORDER BY created DESC";
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
module.exports = router;
