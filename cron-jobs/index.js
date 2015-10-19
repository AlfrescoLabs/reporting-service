/*
 * List of jobs that are run by cron.
 */

var CronJob = require('cron').CronJob;
var request = require('request')
module.exports = {
    "job1 get defects created data" : new CronJob('2 * * * * *', function() {
      console.log('Populating data for defects created report')
      request.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/created', function(err, response, body) {
          console.log(body);
      })
  }, null, true, 'Europe/London'),
  "job2 get open defect ": new CronJob('1 * * * * *', function() {
      console.log('Populating data for defects created report')
      request.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/created', function(err, response, body) {
          console.log(body);
      })
    }, null, true, 'Europe/London')
}
