var config = require('../config')
var db = require('mongoskin').db(config.mongo)

module.exports ={
    create : function(req,res){
        console.log(req.body)
        var name = req.body.name

        console.log("-========-")
        console.log(":::: " + name)
        var testruns = db.collection('testruns')
        res.send(req.body.name)
    }
}
