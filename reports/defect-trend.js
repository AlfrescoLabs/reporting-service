var config = require('../config')
var request = require('request')
var async = require('async')
var headers = {
  "Authorization": config.jira.authentication
};
var db = require('mongoskin').db(config.mongo)

var jiraUrl = config.jira.url

module.exports = {

  /**
   * Get open bug list and populate db.
   */
  updateDefectTrend: function(req, res) {
    var version = req.params.version;
    var targetDate = new Date();
    var day = req.params.day;
    var month = req.params.month;
    var year = req.params.year;
    if (typeof day !== 'undefined' && typeof month !== 'undefined' && typeof year !== 'undefined') {
      targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    }
    var parsedDate = targetDate.getFullYear() + "-" + (new Number(targetDate.getMonth()) + 1) + "-" + targetDate.getDate()
    var tomorrow = new Date(targetDate);
    tomorrow.setDate(targetDate.getDate() + 1);
    var parsedTomorrow = tomorrow.getFullYear() + "-" + (new Number(tomorrow.getMonth()) + 1) + "-" + tomorrow.getDate()
    var json = {
      date: targetDate.getTime(),
      dateDisplay: targetDate.getDate() + '/' + (targetDate.getMonth() + 1) + '/' + targetDate.getFullYear(),
      total:0,
      triaged: {
        count: 0,
        critical: 0,
        blocker: 0,
        issues: []
      },
      open: {
        count: 0,
        critical: 0,
        blocker: 0,
        issues: []
      }
    };
    async.parallel([getData], display);

    function getData(callback) {
      var filter = 'project = ace AND status not in (closed, verified)' +
        'AND (fixVersion = 5.1 OR affectedVersion = 5.1) AND priority ' +
        'in (blocker, critical) AND type in (bug) ORDER BY created DESC'
      console.log(filter)
      var searchApiPath = '/jira/rest/api/2/search?jql=';
      var path = jiraUrl + searchApiPath + filter;
      var option = {
          'url': path,
          headers
        }
        //Query jira for open bugs
      request(option, function(err, response, body) {
        if (err) {
          console.log(err);
          callback(true);
          return;
        }
        var data = JSON.parse(body);
        json.total = data.total;
        var issues = data.issues;
        if (typeof issues !== 'undefined') {
          issues.map(function(issue) {
            var item = {
              id: issue.key,
              link: issue.self,
              type: issue.fields.priority.name
            };
            if (issue.fields.labels.length > 0) {
              //check if triaged
              var triaged = issue.fields.labels.filter(function(x) {
                return x === 'triaged'
              })
              if (triaged.length > 0) {
                if (item.type === 'Blocker') {
                  json.triaged.blocker++;
                }
                if (item.type === 'Critical') {
                  json.triaged.critical++;
                }
                json.triaged.issues.push(item);
                return;
              }
            }

            if (item.type === 'Blocker') {
              json.open.blocker++;
            }
            if (item.type === 'Critical') {
              json.open.critical++;
            }
            json.open.issues.push(item);
          })
          callback(false);
        }
        json.open.count = json.open.issues.length
        json.triaged.count = json.triaged.issues.length
      })
    }
    /*
     * Store and send collated result
     */

    function display(err, results) {
      if (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      //store it to mongodb
      report = db.collection(version + '-trend');
      report.update({
        dateDisplay: json.dateDisplay
      }, json, {
        upsert: true
      }, function(err, result) {
        if (err) {
          console.log('DB error: ' + err);
          res.status(500).send('DB error');
        }
        if (result) {
          res.send(json)
        }
      });
    }
  },
  getDefectTrend: function(req,res){
    var version = req.params.version;
    db.collection(version + '-trend').find({}, {
      "date" : 1,
      "dateDisplay" : 1,
      "open" : 1,
      "triaged" : 1
    }).sort({
      date: 1
    }).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
    })
  }
}
