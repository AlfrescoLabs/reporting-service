var assert = require('assert')
var expect = require('expect')
var should = require('should')
var testlink = require('../reports/testlink')
var moment = require('moment')
var today = moment().format("DD-MM-YY")
var data = {
    'NotRun' : "0",
    'Date' : today,
    'Passed' : "207",
    'Failed' : "8",
    'Blocked' : "4"
}
it('Should get testplan id', function(done){
    this.timeout(10000);
    var json = {'project':'AlfrescoOne','testplan' : 'Ent5.1-ManualRegressionVFOn'}
    testlink.getTestPlanId(json, function(result){
        should.equal('927183', result)
        done()
    })
})

it('Should throw an error if project name is not provided', function(done){
    var json = {"testplanid" : "boo"}
    assert.throws(function(){testlink.getTestPlanReport(json)}, Error)
    done()
})
it('Should throw an error if testplan name is not provided', function(done){
    var json = { 'project':'AlfrescoOne', 'testplanid' : ''}
    assert.throws(function(){testlink.getTestPlanReport(json)}, Error)
    done()
})
it('should display information relating to the test plan execution', function(done){
    var json = { 'project':'AlfrescoOne', 'testplanid' : '927183'}
    testlink.getTestPlanReport(json,function(err,callback){
        expect(data).toEqual(callback)
        done()
    })
})
it('should get a collection of test plans from project name', function(done){
    var json = { 'testprojectid':'460141'}
    testlink.getProjectTestPlans(json,function(response){
        response[0].struct.should.have.property('name')
        response[0].struct.should.have.property('id')
        done()
    })
})
it('should get project id from project name', function(done){
    var json = { 'testprojectname':'AlfrescoOne'}
    testlink.getProjectId(json,function(response){
        expect(response).toEqual("460141")
        done()
    })
})
