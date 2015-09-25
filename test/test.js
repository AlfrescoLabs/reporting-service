var assert = require('assert');
var expect = require('expect');
var superagent = require('superagent');
var should = require('should');
var app = require('../index');


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
// describe('reporting/api/alfresco/5.1', function() {
//   it('Should get data from jira and upsert it to backend',function(done){
//     this.timeout(15000); // Setting a longer timeout
//   })
// });

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
