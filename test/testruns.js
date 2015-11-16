var assert = require('assert')
var expect = require('expect')
var superagent = require('superagent')
var should = require('should')
var app = require('../app')
var config = require('../config')
var db = require('mongoskin').db(config.mongo)

// before(function(done){
//     superagent.post('http://localhost:3000/reporting/api/testruns/create/').send({"name": "test"}).end()
//     done()
// })
var testName = "test" + new Date().getMilliseconds();
var data = {"name":testName}

describe('A test plan is the name of the record which contains the collection of test runs which is ' +
    'the data relating to the execution of tests ',function(done){
    it('Should create and store a test plan',function(done){
        superagent.post('http://localhost:3000/reporting/api/testruns/')
        .set("Content-Type","application/json")
        .send(data).end(function(err, res){
            assert(res.status === 200)
            var json = res.body
            json.should.have.property('error')
            assert(json.error === false)
            done()
        })
    })
    it('Should get a test plan',function(done){
        superagent.get('http://localhost:3000/reporting/api/testruns/' + testName).end(
            function(error,res){
            var json = res.body
            assert(res.status === 200)
            json.should.have.property('name')
            assert(json.name === testName)
            json.should.have.property('runs')
            assert(json.runs.length === 0)
            done()
        })
    })
    it('Should not allow to create a test plan that already exists',function(done){
        superagent.post('http://localhost:3000/reporting/api/testruns/')
        .set("Content-Type","application/json")
        .send(data).end(function(err, res){
            assert(res.status === 200)
            var json = res.body
            json.should.have.property('error')
            assert(json.error === true)
            done()
        })
    })
    // it('Should delete a test plan').end(function(done){
    //     superagent.put('http://localhost:3000/reporting/api/testruns/' + testName)
    // })
})
