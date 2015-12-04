var assert = require('assert')
var expect = require('expect')
var should = require('should')
var testlink = require('../reports/testlink')

var data = {
    'NotRun' : 11,
    'Passed' : 196,
    'Failed' : 8,
    'Blocked' :4
}
it('Should throw an error if project name is not provided', function(done){
    var json = {"testplanname" : "boo"}
    assert.throws(function(){testlink.getTestPlan(json)}, Error)
    done()
})
it('Should throw an error if testplan name is not provided', function(done){
    var json = { projectname:'AlfrescoOne',testplanname : ''}
    assert.throws(function(){testlink.getTestPlan(json)}, Error)
    done()
})
it('should display information relating to the test plan execution', function(done){
    var json = { projectname:'AlfrescoOne',testplanname : 'Ent5.1-ManualRegressionVFOn'}
    testlink.getTestPlan(json,function(callback){
        expect(data).toEqual(callback)
        done()
    })
})
