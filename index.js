var fs = require('fs');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');              //Pulls information from HTML post
var db = require('mongoskin').db('mongodb://localhost:27017/testplatform');

var app = express();
app.use(express.static('./public' + '/public'));            // set the static files location
app.use(bodyParser.urlencoded({'extended':'true'}));        // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                 // parse application/json


var jiraUrl = 'https://issuestest.alfresco.com';
// var jiraUrl = 'https://issues.alfresco.com';
var searchApiPath = '/jira/rest/api/2/search?jql=';

/**
 * Using JIRA API to reterive jira item by jira id.
 * issue: represent the issue id (e.g ACE-4201).
 */
function getJiraIssue(issue, callback){
  var path = jiraUrl + "/jira/rest/api/latest/issue/" + issue;
  var mydata = '';
  console.log(path)
  var req = https.request(path, function(res) {
    res.on('data', function(stream) {
      callback(stream.toString());
    });
  });
  req.end();
  req.on('error', function(e) {
    throw e;
  });
}

/**
 * Get open bug list using alfresco release query.
 * Result is streamed back as json object.
 */
function getOpenBugs(version,callback){
  var filter = "project = ace AND status not in (closed, verified)" +
  "AND (fixVersion = " + version + " OR affectedVersion = " + version + ") " +
  "AND priority in (blocker, critical) AND type in (bug)" +
  "ORDER BY created DESC";

  var path = jiraUrl + searchApiPath + filter;
  var req = https.request(path, function(res){
    res.on('data', function(stream){
      callback(stream);
    });
  });
  req.end();
  req.on('error',function(e){
    throw e;
  })
}

app.get('/reporting/api', function(req,res){
  res.send("Welcome to reporting");
});

app.get('/reporting/api/jira/:issue', function(req,res){
  var issue = req.params.issue;
  var jiraData = ''
  getJiraIssue(issue,function(data){
    jiraData += data;
    res.end(jiraData);
  });

});

app.get('/reporting/api/:product/:version', function(req,res){
  var version = req.params.version;
  var product = req.params.product;
  var jiraData = ''

  res.on('data', function(callback) {
    getOpenBugs(version,function(data){
      res.pipe(data);

    });
  })

});

app.get('/users/:username',function(req,res){
  var name = req.params.username;
  db.collection('report').find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

// function read(){
//   var m = getOpenBugs(callback)
//   console.log(m);
// }
// read();


app.listen(3000);
module.exports = app;
