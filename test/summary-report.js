var superagent = require('superagent')
var should = require('should')
var app = require('../app')
var config = require('../config')
var testrunsSummaryAPI = require('../reports/summary-report')
var moment = require('moment')

describe('Verify that summary report API returns report',function(done){
    it('should return a message when the project name or version are not valid', function(done){
        superagent.get('http://localhost:3000/reporting/api/fictitious/1/report')
        .end(function(err, res){
            should.equal(res.status,200, 'status response')
            var json = res.body
            json.should.have.property('msg')
            should.equal(json.msg,'no data found')
            done()
        })
    })

})
