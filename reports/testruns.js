var config = require('../config')
var scurve = require('../reports/scurve')
var db = require('mongoskin').db(config.mongo)


function getTestRunData(version,name, callback){
    db.collection(version + '-testruns').findOne({"name":name}, function(err,result){
        callback(result)
    })
}
module.exports ={
    create : function(req,res){
        var version = req.params.version
        var testruns = db.collection(version + '-testruns').ensureIndex({name:1}, {unique:true},function(err,res){})
        var data = module.exports.parseTestRun(req,function(err,result){
            if(err){
                res.send({error:true, msg : err})
                return
            }
        })
        testruns.save(
            data,{},function(error,result){
                if(error){
                    res.send({error:true, msg : error.message})
                    return
                }
                res.send({error:false});
            })
    },
    get:function(req,res){
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
        var data = module.exports.parseTestRun(req,function(err){
            if(err){
                res.send({error:true, msg : err})
                return
            }
        })
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
    },
    addEntry : function(req, res){
        var name = req.params.name
        var version = req.params.version
        var data = req.body
        db.collection(version + '-testruns').update(
            { "name": name , "state" : "running" },
            {$addToSet:{"entries":data}},
            {upsert: true},function(err ,result){
            if(err){
                res.send({err:true,msg : err.err})
                return
            }
            res.send({err:false})
        })
    },

    parseTestRun: function(req,callback){
        var name = req.body.name
        var startDate = req.body.startDate
        if(startDate == undefined){
            callback(new Error("Start date is required"))
        }
        var endDate = req.body.endDate
        if(endDate == undefined){
            callback(new Error("End date is required"))
        }
        var targetDate = req.body.targetDate
        var tc = req.body.tc
        if(tc == undefined || tc <=0 ){
            callback(new Error('Valid test case count is required'))
        }
        var data =
            {"name":name,
            "startDate":startDate,
            "endDate": endDate,
            "tc" : tc,
            "state": "ready", // the 3 states: ready, running, finished
            "entries":[],
            "testplans" : []
            }
            if(targetDate !== undefined && targetDate !== null){
                data.targetDate = targetDate
            }
        return data
    },
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
    getBurnDownReport:function(req,res){
        getTestRunData(req.params.version, req.params.name,function(result){
            if(result == undefined){
                return res.end()
            }
            result.scurve = scurve.getScurve(result.startDate, result.endDate, result.tc)
            res.send(result)
        })

    }
}
