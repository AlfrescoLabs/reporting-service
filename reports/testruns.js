var config = require('../config')
var db = require('mongoskin').db(config.mongo)
var testruns = db.collection('testruns').ensureIndex({name:1}, {unique:true},function(err,res){})
module.exports ={
    create : function(req,res){
        var name = req.body.name
        var startDate = req.body.startDate
        var endDate = req.body.endDate
        var targetDate = req.body.targetDate
        var tc = req.body.tc
        var data =
            {"name":name,
            "startDate":startDate,
            "endDate": endDate,
            "tc" : tc,
            "state": "ready", // the 3 states completed, started, ready
            "entries":[]
            }
            if(targetDate !== undefined && targetDate !== null){
                data.targetDate = targetDate
            }
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
        testruns.findOne({"name":name}, function(err,result){
                if(err){
                    res.send({error:true,msg:err.err})
                    return
                }
                res.send(result)
            })
    },
    delete: function(req,res){
        var name = req.params.name
        testruns.remove({"name":name},function(err,result){
            res.send({error:false})
        })
    }
}
