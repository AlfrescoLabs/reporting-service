var config = require('../config')

var db = require('mongoskin').db(config.mongo)
    module.exports = {
    getReport : function(req, res){
        var name = req.params.product
        var version = req.params.version
        db.collection('reports').findOne({"name":name,"version":version}, function(err, result) {
            if(result === null) res.send({msg:"no data found"})
            res.send(result.data)
        });
    }
}
