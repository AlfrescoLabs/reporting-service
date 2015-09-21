var fs = require('fs');
var request = require('request');
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


app.get('/reporting/api', function(req,res){
  res.send("Welcome to reporting");
});

/**
 * Get jira item by issue id.
 */
app.get('/reporting/api/jira/:issue', function(req,res){
  var path = jiraUrl + "/jira/rest/api/latest/issue/" + req.params.issue;
  request(path, function jiraCallback(error, response, body){
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      throw err;
    }
  });
});

/**
 * Get open bug list using alfresco release query.
 * Result is streamed back as json object.
 */
app.get('/reporting/api/alfresco/:version', function(req,res){
  var version = req.params.version;
  var filter = "project = ace AND status not in (closed, verified)" +
  "AND (fixVersion = " + version + " OR affectedVersion = " + version + ") " +
  "AND priority in (blocker, critical) AND type in (bug)" +
  "ORDER BY created DESC";
  var path = jiraUrl + searchApiPath + filter;
  request(path, function jiraCallback(error, response, body){
    res.send(body);
  });
});

app.get('/users/:username',function(req,res){
  var name = req.params.username;
  db.collection('report').find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});



app.listen(3000);
module.exports = app;
