var assert = require('assert')
var expect = require('expect')
var superagent = require('superagent')
var should = require('should')
var app = require('../app')
var db = require('mongoskin').db('mongodb://localhost:27017/testplatform')


describe('reporting/api/alfresco/5.1', function() {
    it('Should get data and store only one entery per day',function(done){
      this.timeout(15000); // Setting a longer timeout
      //Call api to update backend twice, expect one entry as this as an upsert op.
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1').end()
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1').end()
      var today = new Date()
      var parsedDate =  today.getDate()+ "/" + (new Number(today.getMonth()) + 1) + "/" + today.getFullYear()
      db.collection('report').find({'dateDisplay':parsedDate}).toArray(function(err, result) {
        should(1).be.equal(result.length)
        verifyModel(result[0].open)
        done();
      });
    });
});
describe('reporting/api/alfresco/5.1/01/01/2015', function() {
    it('Should only have 1 entery per given date',function(done){
      this.timeout(15000); // Setting a longer timeout
      var targetDate = new Date(2015, 0, 01, 0, 0, 0, 0)
      var parsedDate =  targetDate.getDate()+ "/" + (new Number(targetDate.getMonth()) + 1) + "/" + targetDate.getFullYear()
      //Call api to update backend twice, expect one entry as this as an upsert op.
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/01/01/2015').end(function(err,res){
        assert(res.status === 200)
        should.equal('1/1/2015', res.body.dateDisplay)
        verifyDB(parsedDate)
      })
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/1/1/2015').end(function(err,res){
        assert(res.status === 200)
        should.equal('1/1/2015', res.body.dateDisplay)
        verifyDB(parsedDate)
        done()
      })
    })
    function verifyDB(parsedDate){
      db.collection('report').find({'dateDisplay':parsedDate}).toArray(function(err, result) {
      should(1).be.equal(result.length)
      })
    }
});

describe('reporting/api/alfresco/5.1/status', function() {
  it('should return open and closed jira issues from mongo', function(done) {
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/status').end(
      function(err, res) {
        assert.ifError(err)
        assert(res.status === 200)
        var response = res.body
        //Skip first result as it will be data from a negative test.
        var json = response[1]
        json.should.have.property('date')
        json.should.have.property('dateDisplay')
        verifyModel(json.open)
        verifyModel(json.close)
        done()
      });
  });
});
describe('reporting/api/alfresco/5.1/new/defects', function() {
  it('should only return open jira issues from mongo', function(done) {
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/new/defects').end(
      function(err, res) {
        assert.ifError(err)
        assert(res.status === 200)
        var response = res.body
        var json = response[0]
        json.should.have.property('date')
        should.not.exist(json.close)
        json.should.have.property('open')

        verifyModel(json.open)
        done()
      });
  });
});
function verifyModel(json){
  json.should.have.property('count')
  json.should.have.property('critical')
  json.should.have.property('blocker')
  json.should.have.property('issues')
  var issues = json.issues

  if(json.issues.length > 0){
    should.equal(json.critical+json.blocker, json.count)
    json.issues[0].should.have.property('id')
    issues[0].should.have.property('link')
    issues[0].should.have.property('type')
  } else {
    should.equal(0, json.count)
  }
}
