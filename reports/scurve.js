/*
 * Manages data relating to scurve
 */

var config = require('../config')
var db = require('mongoskin').db(config.mongo)
module.exports = {
    getReport: function(req,res){
        var data = [{"id":1,"date":"1/11/2015","tc":"66"},
                    {"id":2,"date":"2/11/2015","tc":"44"},
                    {"id":3,"date":"3/11/2015","tc":"46"},
                    {"id":4,"date":"4/11/2015","tc":"56"},
                    {"id":5,"date":"5/11/2015","tc":"77"},
                    {"id":6,"date":"6/11/2015","tc":"100"}];
        res.send(data)
    }

}
