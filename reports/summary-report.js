var config = require('../config')

var db = require('mongoskin').db(config.mongo)


    module.exports = {
    getReport : function(req, res){
        var name = req.params.product
        var version = req.params.version
        db.collection(version + '-summary-report').find().toArray(function(err, result) {
            if (err) throw err
            res.send(result)
        });

    }
}
