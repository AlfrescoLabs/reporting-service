/*
 * Manages data relating to scurve
 */

var config = require('../config')
var db = require('mongoskin').db(config.mongo)
module.exports = {
    getReport: function(req,res){
        var data = {tc:100,
                    targetDate:"10/11/2015",
                    data:
                    [{"id":1,"dateDisplay":"1/11/2015","tc":"66"},
                    {"id":2,"dateDisplay":"2/11/2015","tc":"44"},
                    {"id":3,"dateDisplay":"3/11/2015","tc":"46"},
                    {"id":4,"dateDisplay":"4/11/2015","tc":"56"},
                    {"id":5,"dateDisplay":"5/11/2015","tc":"77"},
                    {"id":6,"dateDisplay":"6/11/2015","tc":"100"}]
                };
        res.send(data)
    }

}
