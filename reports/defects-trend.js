/*
 * Manages data relating to reports that display the
 * number of defects created on a given day. The reports uses data
 * in JIRA which is integrated using the API. The results are collected and
 * stored into reporting db.
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
var defectReportSuffix = '-defect-report'
var defectTrendSuffix = '-defect-trend'

module.exports = {
    /**
     * Gets defects stroed in db of the last 60 entries
     */
    getDefects: function(req, res) {
        var version = req.params.version;
        //First we get the latest data
        module.exports.updateDefectReport(req, function() {
            db.collection(version + defectReportSuffix).find({}, {
                "date": 1,
                "dateDisplay": 1,
                "open": 1
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
                        "AND (fixVersion = '" + version + "' OR affectedVersion = '" + version + "') " +
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
                report = db.collection(version + '-report');
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
    },
    /**
     * Display the json response from jira and update local db.
     */
    updateAndDisplayDefects: function(req, res) {
        module.exports.updateDefectReport(req, function(result) {
            res.send(result)
        })
    },
    /**
     * Display the defect trend as a csv.
     */
    getDefectsCSV: function(req, res) {
        var version = req.params.version;
        var csv = '\"Date\","Open CAT 1 defects end of day","open CAT 2 defects end of day","CAT 1 defects pending verification","CAT 2 defects pending verification"' + '\r\n'
        db.collection(version + defectTrendSuffix).find({}, {
            "date": 1,
            "dateDisplay": 1,
            "total": 1,
            "open": 1,
            "pending": 1
        }).sort({
            date: -1
        }).toArray(function(err, result) {
            if (err) throw err;
            //Format to csv
            result.map(function(x) {
                var line = '"' + x.dateDisplay + '","' + x.open.blocker + '","' + x.open.critical + '","' + x.pending.blocker + '","' + x.pending.critical + '"';
                csv += line + '\r\n'

            })
            res.set('Content-Type', 'application/octet-stream');
            res.send(csv);
        })
    },
    getDefectTrend: function(req, res) {
        var version = req.params.version;
        module.exports.updateTrend(req, function() {})
            //Mongo query to get the last 60 days of entries
        db.collection(version + defectTrendSuffix).find({}, {
            "date": 1,
            "dateDisplay": 1,
            "total": 1,
            "open": 1,
            "pending": 1
        }).sort({
            date: -1
        }).limit(60).toArray(function(err, result) {
            if (err) throw err;
            res.send(result);
        })
    },
    updateDefectTrend: function(req, res) {
        module.exports.updateTrend(req, function(result) {
            res.send(result)
        });
    },
    /**
     * Get open bug list and populate db.
     */
    updateTrend: function(req, callback) {
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
            var jql = "project = ace AND status not in (closed, verified)" +
                "AND labels in (triaged)" +
                "AND (fixVersion = '" + version + "')" +
                "AND priority " +
                "in (blocker, critical) AND type in (bug) " +
                "ORDER BY created DESC"

            var searchApiPath = '/jira/rest/api/2/search';
            var path = jiraUrl + searchApiPath;
            var option = {
                    headers: headers,
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
                            type: issue.fields.priority.name,
                            status: issue.fields.status.name
                        };
                        if (issue.fields.labels.length > 0) {
                            //check if pending
                            var status = issue.fields.status.name.toLowerCase()
                            if (status === 'ready to test' || status === 'in test') {
                                if (item.type === 'Blocker') {
                                    model.pending.blocker++;
                                }
                                if (item.type === 'Critical') {
                                    model.pending.critical++;
                                }
                                model.pending.issues.push(item);
                            } else {
                                if (item.type === 'Blocker') {
                                    model.open.blocker++;
                                }
                                if (item.type === 'Critical') {
                                    model.open.critical++;
                                }
                                model.open.issues.push(item);
                            }
                        }
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
            report = db.collection(version + defectTrendSuffix);
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
    /**
     * Get open bug list and populate db.
     */
    updateDefectReport: function(req, callback) {
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
                        "AND (fixVersion = '" + version + "' OR affectedVersion = '" + version + "') " +
                        "AND priority in (blocker, critical) AND type in (bug)" +
                        "AND created >= " + parsedDate + " AND created <= " + parsedTomorrow +
                        " ORDER BY created DESC";

                    var path = jiraUrl + searchApiPath + filter;
                    console.log(path)
                    var option = {
                        url: path,
                        headers: headers
                    }

                    //Query jira for open bugs
                    request(option, function(err, response, body) {
                        // JSON body
                        if (err || body === undefined) {
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
                                }
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
                report = db.collection(version + defectReportSuffix);
                report.update({
                        dateDisplay: json.dateDisplay
                    },
                    json, {
                        upsert: true
                    },
                    function(err, result) {
                        if (err) {
                            console.log('DB error: ' + err);
                            callback(false)
                        }
                        callback(json)
                    });
            })
    }
}
