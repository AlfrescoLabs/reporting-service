var assert = require('assert');
var expect = require('expect');
var superagent = require('superagent');
var should = require('should');
var app = require('../app');
var db = require('mongoskin').db('mongodb://localhost:27017/testplatform');


describe('reporting/api/alfresco/5.1', function() {
    it('Should get data and store only one entery per day',function(done){
      this.timeout(15000); // Setting a longer timeout
      //Call api to update backend twice, expect one entry as this as an upsert op.
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1').end();
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1').end();
      var today = new Date();
      var parsedDate =  today.getDate()+ "/" + (new Number(today.getMonth()) + 1) + "/" + today.getFullYear();
      db.collection('report').find({'dateDisplay':parsedDate}).toArray(function(err, result) {
        should(1).be.equal(result.length);
        verifyModel(result[0]);
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
        assert(res.status === 200);
        should.equal('1/1/2015', res.body.dateDisplay);
        verifyDB(parsedDate)
      })
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/1/1/2015').end(function(err,res){
        assert(res.status === 200);
        should.equal('1/1/2015', res.body.dateDisplay);
        verifyDB(parsedDate)
        done()
      })
    })
    function verifyDB(parsedDate){
      db.collection('report').find({'dateDisplay':parsedDate}).toArray(function(err, result) {
      should(1).be.equal(result.length);
      verifyModel(result[0]);
      })
    }
});

describe('reporting/api/alfresco/5.1/status', function() {
  it('should return open and closed jira issues from mongo', function(done) {
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/status').end(
      function(err, res) {
        assert.ifError(err);
        assert(res.status === 200);
        var response = res.body;
        //Skip first result as it will be data from a negative test.
        var json = response[1];
        json.should.have.property('date');
        json.open.should.have.property('blocker');
        json.open.should.have.property('critical');
        should.equal(json.open.critical+json.open.blocker, json.open.count)
        json.close.should.have.property('blocker');
        json.close.should.have.property('critical');
        should.equal(json.close.critical+json.close.blocker, json.close.count)
        verifyModel(json);
        done();
      });
  });
});
describe('reporting/api/alfresco/5.1/new/defects', function() {
  it('should only return open jira issues from mongo', function(done) {
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/new/defects').end(
      function(err, res) {
        assert.ifError(err);
        assert(res.status === 200);
        var response = res.body;
        var json = response[0];
        json.should.have.property('date');
        json.open.should.have.property('blocker');
        json.open.should.have.property('critical');
        should.equal(json.open.critical+json.open.blocker, json.open.count)
        should.not.exist(json.close);
        json.should.have.property('open');
        json.open.should.have.property('count');
        json.open.should.have.property('issues');
        done();
      });
  });
});
function verifyModel(json){
  json.should.have.property('open');
  json.open.should.have.property('count');
  json.open.should.have.property('issues');
  json.should.have.property('close');
  json.close.should.have.property('count');
  json.close.should.have.property('issues');
//   var issues = json.close.issues;
//   issues[0].should.have.property('id');
//   issues[0].should.have.property('link');
//   issues[0].should.have.property('type');
}
