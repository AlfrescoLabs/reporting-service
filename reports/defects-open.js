/*
 * Manages data relating to reports that display the
 * number of open defects on a given day.
 */
var config = require('../config')
var request = require('request')
var async = require('async')
var headers = {
  'Content-Type': 'application/json',
  "Authorization": config.jira.authentication
};
var db = require('mongoskin').db(config.mongo)
var jiraUrl = config.jira.url

module.exports = {
  updateDefectTrend : function(req,res){
      module.exports.update(req, function(result){
          res.send(result)
      });
  },
  /**
   * Get open bug list and populate db.
   */
  update: function(req, callback) {
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
    var model = {
      date: targetDate.getTime(),
      dateDisplay: targetDate.getDate() + '/' + (targetDate.getMonth() + 1) + '/' + targetDate.getFullYear(),
      total: 0,
      pending: {
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
    async.parallel([getData], save);

    function getData(callback) {
      var jql = 'project = ace AND status not in (closed, verified)' +
        'AND (fixVersion = 5.1) AND priority ' +
        'in (blocker, critical) AND type in (bug) ' +
        ' ORDER BY created DESC'

      var searchApiPath = '/jira/rest/api/2/search';
      var path = jiraUrl + searchApiPath;
      var option = {
        headers,
        'url': path,
        'json': {
          'jql': jql,
          "startAt": 0,
          "maxResults": 1000
        }
      }
      //Query jira for open bugs
      request.post(option, function(err, response, body) {
        if (err) {
          console.log(err)
          callback(true)
          return
        }
        var data = body.issues
        model.total = body.issues.length
        var issues = body.issues
        if (typeof issues !== 'undefined') {
          issues.map(function(issue) {
            var item = {
              id: issue.key,
              link: issue.self,
              type: issue.fields.priority.name
            };
            if (issue.fields.labels.length > 0) {
              //check if pending
              var status = issue.fields.status.name.toLowerCase()
              if(status === 'ready to test' || status === 'in test'){
                if (item.type === 'Blocker') {
                  model.pending.blocker++;
                }
                if (item.type === 'Critical') {
                  model.pending.critical++;
                }
                model.pending.issues.push(item);
                return;
              }
            }
            if (item.type === 'Blocker') {
              model.open.blocker++;
            }
            if (item.type === 'Critical') {
              model.open.critical++;
            }
            model.open.issues.push(item);
          })
          model.open.count = model.open.issues.length
          model.pending.count = model.pending.issues.length
          callback(false);
        }
      })
    }
    /*
     * Store and send collated result
     */
    function save(err, results) {
      if (err) {
        console.log(err);
        callback(false);
        return;
      }
      //store it to mongodb
      report = db.collection(version + '-trend');
      report.update({
        dateDisplay: model.dateDisplay
      }, model, {
        upsert: true
      }, function(err, result) {
        if (err) {
          console.log('DB error: ' + err);
          callback(false);
        }
        if (result) {
          callback(model);
        }
      });
    }
  },
  getDefectTrend: function(req, res) {
    var version = req.params.version;
    module.exports.update(req,function(){})
    db.collection(version + '-trend').find({}, {
      "date": 1,
      "dateDisplay": 1,
      "total":1,
      "open": 1,
      "pending": 1
    }).sort({
      date: -1
    }).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
    })
  }
}
