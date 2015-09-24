var request = require('request');
var async = require('async');
var express = require('express');
var bodyParser = require('body-parser'); //Pulls information from HTML post
var db = require('mongoskin').db('mongodb://localhost:27017/testplatform');

var app = express();
app.use(express.static('./public' + '/public')); // set the static files location
app.use(bodyParser.urlencoded({
  'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json


var jiraUrl = 'https://issuestest.alfresco.com';
// var jiraUrl = 'https://issues.alfresco.com';
var searchApiPath = '/jira/rest/api/2/search?jql=';


app.get('/reporting/api', function(req, res) {
  res.send("Welcome to reporting");
});

/**
 * Get jira item by issue id.
 */
app.get('/reporting/api/jira/:issue', function(req, res) {
  var path = jiraUrl + "/jira/rest/api/latest/issue/" + req.params.issue;
  request(path, function jiraCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      throw err;
    }
  });
});


app.get('/reporting/api/alfresco/:version', processQuery);
/**
 * Get open bug list using alfresco release query.
 * Result is streamed back as json object.
 */
function processQuery(req, res) {
  var version = req.params.version;
  var json = {
    open: {
      count: 0,
      issues: []
    },
    close: {
      count: 0,
      issues: []
    }
  };
  async.parallel([
    /**
     * Get open bugs and populate json object.
     */
    function getOpenBugs(callback) {
      var filter = "project = ace AND status not in (closed, verified)" +
        "AND (fixVersion = " + version + " OR affectedVersion = " + version + ") " +
        "AND priority in (blocker, critical) AND type in (bug)" +
        "ORDER BY created DESC";
      var path = jiraUrl + searchApiPath + filter;
      //Query jira for open bugs
      request(path, function(err, response, body) {
        // JSON body
        if(err) { console.log(err); callback(true); return; }
        var data = JSON.parse(body);
        json.open.count = data.total;
        var issues = data.issues;
        issues.map(function(issue) {
          var item = {
            id: issue.key,
            link: issue.self,
            type: issue.fields.priority.name
          };
          json.open.issues.push(item);
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
        "ORDER BY created DESC";
      var path = jiraUrl + searchApiPath + filter;
      //Query jira for open bugs
      request(path, function(err, response, body) {
        if(err){ console.log(err); callback(true); return;}
        var data = JSON.parse(body);
        json.close.count = data.total;
        var issues = data.issues;
        issues.map(function(issue) {
          var item = {
            id: issue.key,
            link: issue.self,
            type: issue.fields.priority.name
          };
          json.close.issues.push(item);
        });
        callback(false);
      });
    }],
    /*
     * Send collated result
     */
    function(err, results) {
      if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        return;
      }
      res.send(json)
    }
  )}

app.get('/users/:username', function(req, res) {
  var name = req.params.username;
  db.collection('report').find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

app.listen(3000);
module.exports = app;
