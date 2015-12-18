var TestlinkConnect = require("testlink-connect");
var moment = require('moment')
var config = require('../config')
var testlink = new TestlinkConnect(config.testlink.key, config.testlink.url)
module.exports = {
    getTestPlanReport:function(json, callback){
        if(json == null){
            throw new Error('Project name is required')
        }
        if(json.project == null || json.project.length === 0){
            throw new Error('Project name is required')
        }
        if(json.testplanid == null || json.testplanid.length === 0){
            throw new Error('Test plan id is required')
        }
        testlink.getTotalsForTestPlan(json, function(res){
            var result = {
                'Date' : moment().format("DD-MM-YY"),
                'NotRun' : res.struct._n.exec_qty,
                'Passed' : res.struct._p.exec_qty,
                'Failed' : res.struct._f.exec_qty,
                'Blocked' :res.struct._b.exec_qty
            }
            callback(null,result)
        });
    },
    getTestPlanId : function(json, callback){
        var obj = {
            'testprojectname' : json.project,
            'testplanname' : json.testplan
        };
        testlink.getTestPlanByName(obj,function(res){
            callback(res.struct.id)
        })
    },
    getProjectTestPlans: function(params, callback){
        testlink.getProjectTestPlans(params, function(res){
            callback(res)
        })
    },
    getProjectId : function(json, callback){
        testlink.getTestProjectByName(json,function(res){
            callback(res.struct.id)
        })
    },
}
