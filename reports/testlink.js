var TestlinkConnect = require("testlink-connect");
var config = require('../config')
module.exports = {
    getTestPlan:function(callback){
        var testlink = new TestlinkConnect(config.testlink.key, config.testlink.url)

        var obj = {
            'testprojectname':'AlfrescoOne',
            'testplanname':'Ent5.1-ManualRegressionVFOn',
            'testplanid' : '927183'
        };
        // testlink.getTestPlanByName(obj,function(res){
        //     callback(res)
        // });
        //(NotRun , Passed,Failed, Blocked)
        testlink.getTotalsForTestPlan(obj,function(res){
            var data = {
                'NotRun' : res.struct._n.exec_qty,
                'Passed' : res.struct._p.exec_qty,
                'Failed' : res.struct._f.exec_qty,
                'Blocked' :res.struct._b.exec_qty
            }
            callback(data)
        });

    }
}
