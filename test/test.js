var assert = require('assert');
var expect = require('expect');
var superagent = require('superagent');
var should = require('should');
var app = require('../index');
var db = require('mongoskin').db('mongodb://localhost:27017/testplatform');


describe('/reporting/api', function() {
  before(function(done) {
    done();
  });
  after(function(done) {
    done();
  });

  it('should return a welcome message', function(done) {
    superagent.get('http://localhost:3000/reporting/api').end(
      function(err, res) {
        assert.ifError(err);
        assert(res.status === 200);
        done();
      });
  });
});

describe('reporting/api/alfresco/5.1', function() {
  it('Should get data from jira and upsert it to mongo',function(done){
    this.timeout(15000); // Setting a longer timeout
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1').end(
      function(err, res) {
        assert.ifError(err);
        assert(res.status === 200);
        var json = res.body;
        json.should.have.property('date');
        done();
      });
    });
    it('Should only have one entery per day',function(done){
      this.timeout(15000); // Setting a longer timeout
      //Call api to update backend twice
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1').end();
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1').end();
      var today = new Date().toLocaleDateString();
      db.collection('report').find({date:today}).toArray(function(err, result) {
        result.length.should.be.below(2);
        done();
      });
    });
});

describe('reporting/api/alfresco/5.1/status', function() {

  it('should return open and closed jira issues from mongo', function(done) {

    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/status').end(
      function(err, res) {
        assert.ifError(err);
        assert(res.status === 200);
        var response = res.body;
        var json = response[0];
        json.should.have.property('date');
        // var date = new Date().toLocaleDateString();
        // json.date.should.be.eql(date);
        json.should.have.property('open');
        json.open.should.have.property('count');
        json.open.should.have.property('issues');
        json.should.have.property('close');
        json.close.should.have.property('count');
        json.close.should.have.property('issues');
        var issues = json.close.issues;
        issues[0].should.have.property('id');
        issues[0].should.have.property('link');
        issues[0].should.have.property('type');
        done();
      });
  });
});
