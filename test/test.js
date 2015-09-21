var assert = require('assert');
var expect = require('expect');
var superagent = require('superagent');
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
      function(err, res){
        assert.ifError(err);
        assert(res.status === 200);
        done();
      });
  });
});
describe('/reporting/api/:product/:version', function() {
  before(function(done) {
    done();
  });
  after(function(done) {
    done();
  });

  it('should return open jira issues', function(done) {
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1').end(
      function(err, res){
        assert.ifError(err);
        assert(res.status === 200);
        done();
      });
  });
});
