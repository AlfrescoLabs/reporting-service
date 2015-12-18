var config = require('../config')
var scurve = require('../reports/scurve')
var db = require('mongoskin').db(config.mongo)
var testlink = require('./testlink')
var moment = require('moment')
var async = require('async')

function getTestRunData(version, name, callback){
    db.collection(version + '-testruns').findOne({"name":name}, function(err,result){
        callback(result)
    })
}
module.exports ={
    create : function(req, res){
        var version = req.params.version
        var testruns = db.collection(version + '-testruns').ensureIndex({name:1}, {unique:true},function(err,res){})
        module.exports.parseTestRun(req,function(err,parsedData){
            if(err){
                return res.send({error:true, msg : err})
            }
            testruns.save(parsedData, {}, function(error,result){
                    if(error){
                        res.send({error:true, msg : error.message})
                        return
                    }
                    res.send({error:false});
            })
        })
    },
    get:function(req, res){
        var name = req.params.name
        var version = req.params.version
        getTestRunData(version, name,function(result){
            res.send(result)
        })
    },
    delete: function(req,res){
        var name = req.params.name
        var version = req.params.version
        db.collection(version + '-testruns').remove({"name":name},
        function(err,result){
            res.send({error:false})
        })
    },
    update: function(req,res){
        module.exports.parseTestRun(req,function(err,data){
            if(err){
                res.send({error:true, msg : err})
                return
            }
            var version = req.params.version
            db.collection(version + '-testruns').update(
                { "name" : data.name, "state" : "ready" },
                data,
                { upsert: true }, function(err, result){
                if(err){
                    res.send({error:true,msg:err.err})
                    return
                }
                res.send(data)
        })

        })
    },
    //Add test run entry manually.
    addEntry : function(req, res){
        var name = req.params.name
        var version = req.params.version
        var data = req.body
        module.exports.saveEntry(name, version, data, function(err, callback){
            if(err){
                return res.send({err:true, msg : err.err})
            }
            if(callback){
                res.send({err:false})
            }
        })
    },
    //Function that save entry to mongo
    saveEntry : function(name, version, data, callback){
        db.collection(version + '-testruns').update(
            { "name": name , "state" : "running" },
            {$addToSet:{"entries" : data}},
            {upsert: true},function(err ,result){
            if(err){
                callback(err)
            }
            callback(null, result)
        })
    },

    //Update entry via testlink
    updateEntry : function(req , res){
        var name = req.params.name
        var version = req.params.version

        getTestRunData(version, name, function(result){
            if(result == undefined){
                return res.send({err:true, msg : "Unable to find record"})
            }
            if(result.state === 'finished'){
                return res.send({err:true, msg : "Test run is not active"})
            }
            module.exports.generateEntry(result.project, result.testplans, function(err, callback){
                if(err){
                    return res.send({err:true, msg: err})
                }
            })
        })
    },

    parseTestRun: function(req, callback){
        var name = req.body.name
        var startDate = req.body.startDate
        if(startDate == undefined){
            callback(new Error("Start date is required"))
            return
        }
        var endDate = req.body.endDate
        if(endDate == undefined){
            callback(new Error("End date is required"))
            return
        }
        var project = req.body.project
        if(project == undefined){
            callback(new Error("project name is required"))
            return
        }
        var targetDate = req.body.targetDate
        var tc = req.body.tc
        if(tc == undefined || tc <= 0 ){
            callback(new Error('Valid test case count is required'))
            return
        }
        var testplans = req.body.testplans
        var data =
            {"name":name,
            "startDate":startDate,
            "endDate": endDate,
            "tc" : tc,
            "state": "ready", // the 3 states: ready, running, finished
            "entries":[],
            "project" : project,
            "testplans" : testplans
            }
            if(targetDate !== undefined && targetDate !== null){
                data.targetDate = targetDate
            }
        callback(null, data)
    },
    /**
     * Sets a flag to indicate the run has started, once started the run cant
     * be edited.
     */
    start: function(req, res){
        var version = req.params.version
        var name = req.params.name
        db.collection(version + '-testruns').update({"name":name,"state":"ready"},
                        {$set:{"state":"running"}},
                        function(err,result){
            if(err){
                res.send({"err":true, "msg":err.err})
                return
            }
            res.send({err:false})
        })
    },
    stop: function(req, res){
        var name = req.params.name
        var version = req.params.version
        db.collection(version + '-testruns').update({"name":name},
                        {$set:{"state":"finished"}},function(err,result){
            if(err){
                res.send({"err":true, "msg":err.err})
                return
            }
            res.send({err:false})
        })
    },
    getBurnDownReport : function(req,res){
        getTestRunData(req.params.version, req.params.name,function(result){
            if(result == undefined){
                return res.end()
            }
            result.scurve = scurve.getScurve(result.startDate, result.endDate, result.tc)
            res.send(result)
        })
    },
    // Function which collects all results of test execution and summarizes into an entry.
    generateEntry : function(project, testplans, callback){
        var data = {
            date: moment().format("DD-MM-YY"),
            defectTarget: 0,
            defectActual: 0,
            testRemaining: 0,
            testExecuted: 0,
            failedTest: 0
        }
        async.each(testplans,
            function(testplan, done){
                var json = { 'project':project, 'testplanid' : testplan.testplanid}
                testlink.getTestPlanReport(json,function(err, result){
                    if(err){
                        return done(err)
                    }
                    //Add new values to entry to make a summary
                    data.testExecuted = data.testExecuted + Number(result.Passed)
                    data.failedTest = data.failedTest + Number(result.Failed)
                    done()
                })
        },
        function(err){
            callback(null, data)
        })
    }
}
