/*
 * Manages data relating to reports that display the
 * number of defects created on a given day
 */
var request = require('request') //http request
var config = require('../config')
var db = require('mongoskin').db(config.mongo)
var async = require('async') //async lib
var jiraUrl = config.jira.url;
var searchApiPath = '/jira/rest/api/2/search?jql=';
var headers = {
  "Authorization": config.jira.authentication
};

module.exports = {

  /**
   * Gets defects stroed in db of the last 60 entries
   */
  getDefects: function(req, res) {
    var version = req.params.version;
    //First we get the latest data
    module.exports.update(req, function(){
        db.collection(version + '-report').find({}, {
          "date" : 1,
          "dateDisplay" : 1,
          "open" : 1
        }).sort({
          date: -1
      }).limit(60).toArray(function(err, result) {
          if (err) throw err;
          res.send(result);
        })
    })
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
    var parsedDate = targetDate.getFullYear() + "-" + (new Number(targetDate.getMonth()) + 1) + "-" + targetDate.getDate();
    var tomorrow = new Date(targetDate);
    tomorrow.setDate(targetDate.getDate() + 1);
    var parsedTomorrow = tomorrow.getFullYear() + "-" + (new Number(tomorrow.getMonth()) + 1) + "-" + tomorrow.getDate();
    //The data model
    var json = {
      date: targetDate.getTime(),
      dateDisplay: targetDate.getDate() + '/' + (targetDate.getMonth() + 1) + '/' + targetDate.getFullYear(),
      open: {
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
          var filter = "project = ace " +
            "AND (fixVersion = " + version + " OR affectedVersion = " + version + ") " +
            "AND priority in (blocker, critical) AND type in (bug)" +
            "AND created >= " + parsedDate + " AND created <= " + parsedTomorrow +
            " ORDER BY created DESC";

          var path = jiraUrl + searchApiPath + filter;
          var option = {
            url: path,
            headers: headers
          }

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
            if (typeof issues !== 'undefined') {
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
              });
            }
            callback(false);
          });
        }
      ],

      /*
       * Store and send collated result
       */
      function save(err, results) {
        //store it to mongodb
        report = db.collection(version+'-report');
        report.update({
          dateDisplay: json.dateDisplay
        }, json, {
          upsert: true
        }, function(err, result) {
          if (err) {
            console.log('DB error: ' + err);
            callback(false)
          }
          callback(json)
        });
      })
  }
    ,
    /**
     * Display the json response from update defect.
     */
     updateAndDisplayDefects: function(req, res) {
        module.exports.update(req,function(result){
            res.send(result)
        })
     }
}
