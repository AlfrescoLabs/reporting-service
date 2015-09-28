var request = require('request');        //http request
var async = require('async');            //async lib
var express = require('express');        // Web framework
var bodyParser = require('body-parser'); //Pulls information from HTML post
var db = require('mongoskin').db('mongodb://localhost:27017/testplatform');
var path = require("path");             //System path
var React = require('react');           //React.js
var jsx = require('node-jsx');          //JS extension relates to react
var app = express();
// app.set('views', __dirname);
// app.set('view engine', 'html');
app.use(bodyParser.urlencoded({
  'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(express.static(path.join(__dirname, 'public'))); // Include static assets. Not advised for production

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
    date: new Date().toLocaleDateString(),
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
      console.log(json.date)
      var query = '{"date":"9/25/2015"}';
      //store it to mongodb
      report = db.collection('report');
      report.update({date:json.date}, json, {upsert:true},function(err,result){
        if(err){
          console.log('DB error: ' + err);
          res.status(500).send('DB error');
        }
        if(result) {
          console.log('Added record');
          res.send(json)
        }
      });
    }
  )
}
/**
 * Get status of release from db.
 */
app.get('/reporting/api/alfresco/:version/status', function(req, res) {
  var name = req.params.version;
  db.collection('report').find({}).toArray(function(err, result) {
    if (err) throw err;
    res.send(result);
  });
});
/**
 * Display graph.
 */
app.get('/reporting/api/alfresco/:version/graph', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});
app.listen(3000);
module.exports = app;
