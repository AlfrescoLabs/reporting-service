var config = require('../config')
var db = require('mongoskin').db(config.mongo)
var testruns = db.collection('testruns').ensureIndex({name:1}, {unique:true},function(err,res){})
module.exports ={
    create : function(req,res){
        var name = req.body.name
        testruns.save(
            {"name":name,
             "runs":[]
            },{},function(error,result){
                if(error){
                    res.send({error:true, msg : "Unable to create the test plan"})
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
