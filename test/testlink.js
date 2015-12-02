var assert = require('assert')
var expect = require('expect')
var should = require('should')
var testlink = require('../reports/testlink')

var data = {
    'NotRun' : 21,
    'Passed' : 187,
    'Failed' : 7,
    'Blocked' :4
}

it('should display information relating to the test plan execution', function(done){
    testlink.getTestPlan(function(callback){
        expect(data).toEqual(callback)
        done()
    })

})
