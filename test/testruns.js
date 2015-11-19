var assert = require('assert')
var expect = require('expect')
var superagent = require('superagent')
var should = require('should')
var app = require('../app')
var config = require('../config')
var db = require('mongoskin').db(config.mongo, {safe:true})

before('Prepare db',function(done){
    db.open(function(err, db) {
        db.collection('testruns').drop()
        db.collection('testruns').ensureIndex({name:1}, {unique:true},function(err,res){
            done()
        })
    })
})
var testName = "mytest";
var data = {"name":testName,
            "startDate":"12/11/2100",
            "endDate": "12/12/2100",
            "targetDate" : null,
            "tc" : 1000}
var newdata = {"name":testName,
            "startDate":"12/11/2200",
            "endDate": "12/12/2200",
            "targetDate" :"12/12/2200",
            "tc" : 100}

var dataEntry = {
    date: '14/12//2015',
    defectTarget:10,
    defectActual:20,
    testRemaining:4000,
    testExecuted:100,
    failedTest:40
}

var q = {"name":testName}

describe('The test run captures the data relating to test execution of a run, which is a period of time defined by a start and end date.' ,function(done){
    it('Should create and store a test run',function(done){
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
    it('Should not create a test run as tc is missing',function(done){
        var baddata = {"name":"missingTC", "startDate":"12/11/2100", "endDate": "12/12/2100", "targetDate" : null}
        superagent.post('http://localhost:3000/reporting/api/testruns/')
        .set("Content-Type","application/json")
        .send(baddata).end(function(err, res){
            assert(res.status === 200)
            var json = res.body
            json.should.have.property('error')
            assert(json.error === true)
            done()
        })
    })
    it('Should not create a test run as end date is null',function(done){
        var baddata = {"name":"missingTC", "startDate":"12/11/2100", "endDate": null, "targetDate" : null}
        superagent.post('http://localhost:3000/reporting/api/testruns/')
        .set("Content-Type","application/json")
        .send(baddata).end(function(err, res){
            assert(res.status === 200)
            var json = res.body
            json.should.have.property('error')
            assert(json.error === true)
            done()
        })
    })
    it('Should not create a test run as start date is undefined',function(done){
        var baddata = {"name":"missingTC", "startDate": undefined, "endDate": "12/11/2100", "targetDate" : null}
        superagent.post('http://localhost:3000/reporting/api/testruns/')
        .set("Content-Type","application/json")
        .send(baddata).end(function(err, res){
            assert(res.status === 200)
            var json = res.body
            json.should.have.property('error')
            assert(json.error === true)
            done()
        })
    })
    it('Should get a test run',function(done){
        superagent.get('http://localhost:3000/reporting/api/testruns/' + testName).end(
            function(error,res){
                var json = res.body
                assert(res.status === 200)
                json.should.have.property('name')
                assert(json.name === testName)
                json.should.have.property('startDate')
                assert(json.startDate === '12/11/2100')
                json.should.have.property('endDate')
                assert(json.endDate === '12/12/2100')
                json.should.have.property('tc')
                    assert(json.tc === 1000)
                json.should.have.property('state')
                assert(json.state === 'ready')
                json.should.have.property('entries')
                assert(json.entries.length === 0)
                json.should.not.have.property('targetDate')
                done()
            })
    })
    it('Should not allow to create a test run that already exists',function(done){
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
    it('Should allow update of test run if state is ready', function(done){
        superagent.put('http://localhost:3000/reporting/api/testruns/')
        .set("Content-Type","application/json")
        .send(newdata).end(function(err, res){
            var json = res.body
            assert(res.status === 200)
            json.should.have.property('name')
            should.equal(json.name, testName ,"name value")
            json.should.have.property('startDate')
            should.equal(json.startDate,'12/11/2200')
            json.should.have.property('endDate')
            assert(json.endDate === '12/12/2200')
            json.should.have.property('tc')
                assert(json.tc === 100)
            json.should.have.property('state')
            assert(json.state === 'ready')
            json.should.have.property('entries')
            assert(json.entries.length === 0)
            json.should.have.property('targetDate')
            assert(json.targetDate === '12/12/2200')
            done()
        })
    })
    it('Should not allow update of test run if state isnt ready', function(done){
        //update data state in mongodb
        db.open(function(err, db) {
            db.collection('testruns', {}, function(err, testruns) {
                testruns.update(q,{$set:{state : "complete"}}, function(err,result){
                    superagent.put('http://localhost:3000/reporting/api/testruns/')
                    .set("Content-Type","application/json")
                    .send(newdata).end(function(err, res){
                        var json = res.body
                        assert(res.status === 200)
                        json.should.have.property('error')
                        should.equal(json.error,true)
                        done()
                    })
                })
            })
        })
    })
    it('should be able to update entries with a new entry', function(done){
        db.open(function(err, db) {
            db.collection('testruns', {}, function(err, testruns) {
                testruns.findOne(q,function(error,result){
                    should.equal(result.entries.length,0)
                    superagent.put('http://localhost:3000/reporting/api/testruns/'+ testName)
                    .set("Content-Type","application/json")
                    .send(dataEntry).end(function(err,res){
                        testruns.findOne(q,function(error,result){
                            should.equal(result.entries.length,1)
                            var entry = result.entries[0]
                            entry.should.have.property('date')
                            entry.should.have.property('defectTarget')
                            entry.should.have.property('defectActual')
                            entry.should.have.property('testRemaining')
                            entry.should.have.property('testExecuted')
                            entry.should.have.property('failedTest')

                            should.equal(entry.date, '14/12//2015' ,"date value")
                            should.equal(entry.defectTarget, 10 ,"defectTarget")
                            should.equal(entry.defectActual, 20 ,"defectActual")
                            should.equal(entry.testRemaining, 4000 ,"testRemainingvalue")
                            should.equal(entry.testExecuted, 100 ,"testExecuted value")
                            should.equal(entry.failedTest, 40 ,"failedTest value")
                            done()
                        })
                    })
                })
            })
        })
    })
    it('Should delete a test run',function(done){
        db.open(function(err, db) {
            db.collection('testruns', {}, function(err, testruns) {
                testruns.find(q, function(err,result){
                    should.exist(result)
                    superagent.del('http://localhost:3000/reporting/api/testruns/'+ testName).end(function(err,res){
                        testruns.findOne(q,function(err,result){
                            should.not.exist(result)
                            done()
                        })
                    })
                })
            })
        })
    })
})
