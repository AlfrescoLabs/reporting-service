var assert = require('assert')
var expect = require('expect')
var superagent = require('superagent')
var should = require('should')

describe('Verify that we can create,get,update and delete a test',function(done){
    it('Should create and store a test plan',function(done){
        superagent.post('http://localhost:3000/reporting/api/testruns/create/')
        .send({"name": "5.1"})
        .end(function(err, res) {
            console.log(res)
            done();
            //assert(res.status === 200)
        })
    })
})
