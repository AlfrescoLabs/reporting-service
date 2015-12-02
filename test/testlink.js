var assert = require('assert')
var expect = require('expect')
var should = require('should')
var testlink = require('../reports/testlink')

var data = {
    'NotRun' : 24,
    'Passed' : 184,
    'Failed' : 7,
    'Blocked' :4
}

it('should display test plan information', function(done){
    testlink.getTestPlan(function(callback){
        console.log("its done " + callback)
        expect(data).toEqual(callback)
        done()
    })

})
