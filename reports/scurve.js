/*
 * Manages data relating to scurve
 */

var config = require('../config')
var db = require('mongoskin').db(config.mongo)
module.exports = {
    getReport: function(req,res){
        var data = {tc:100,
                    targetDate:"10/11/2015",
                    startDate:"1/11/2015",
                    data:
                    [{"id":1,"day":"1","tc":"66"},
                    {"id":2,"day":"2","tc":"44"},
                    {"id":3,"day":"3","tc":"46"},
                    {"id":4,"day":"4","tc":"56"},
                    {"id":5,"day":"5","tc":"77"},
                    {"id":6,"day":"6","tc":"100"}]
                };
        res.send(data)
    }

}
