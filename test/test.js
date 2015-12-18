var superagent = require('superagent')
var should = require('should')
var app = require('../app')
var config = require('../config')
var db = require('mongoskin').db(config.mongo)
var async = require('async')

before(function(done){
  this.timeout(15000); // Setting a longer timeout
  //Call api to update backend twice, expect one entry as this as an upsert op.
  async.parallel([
    function callApi(callback){
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/created').end(function(err,res){
        should.equal(res.status, 200)
        callback()
      })
    }
    ,
    function callApi2nd(callback){
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/created').end(function(err,res){
        should.equal(res.status,200)
        callback()
      })
    }],
    function(){
      done()
    })
})
describe('reporting/api/alfresco/5.1/defects/created', function() {
    it('Should get data and store only one entery per day',function(done){
      var today = new Date()
      var parsedDate =  today.getDate()+ "/" + (new Number(today.getMonth()) + 1) + "/" + today.getFullYear()
      db.collection('5.1-report').find({'dateDisplay':parsedDate}).toArray(function(err, result) {
        console.log(result)
        should.equal(1, result.length)
        verifyModel(result[0].open)
        done();
      });
    });
});
describe('reporting/api/alfresco/5.1/defects/created/01/01/2015', function() {
    it('Should only have 1 entery per given date',function(done){
      this.timeout(15000); // Setting a longer timeout
      var targetDate = new Date(2015, 0, 01, 0, 0, 0, 0)
      var parsedDate =  targetDate.getDate()+ "/" + (new Number(targetDate.getMonth()) + 1) + "/" + targetDate.getFullYear()
      //Call api to update backend twice, expect one entry as this as an upsert op.
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/created/01/01/2015').end(function(err,res){
        should.equal(res.status,200)
        should.equal('1/1/2015', res.body.dateDisplay)
        verifyDB(parsedDate)
      })
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/created/1/1/2015').end(function(err,res){
        should.equal(res.status,200)
        should.equal('1/1/2015', res.body.dateDisplay)
        verifyDB(parsedDate)
        done()
      })
    })
    function verifyDB(parsedDate){
      db.collection('5.1-report').find({'dateDisplay':parsedDate}).toArray(function(err, result) {
      should(1).be.equal(result.length)
      })
    }
})
after(function(done){
  if(db.databaseName === "test-testplatform"){
    db.dropDatabase(function(){
      done();
  	});
  }else{
    done()
  }
});

describe('reporting/api/alfresco/5.1/defects/created', function() {
  it('should only return open jira issues from mongo', function(done) {
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/created').end(
      function(err, res) {
        should.equal(res.status,200)
        var response = res.body
        response.should.have.property('date')
        should.not.exist(response.close)
        response.should.have.property('open')
        verifyModel(response.open)
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
    should.equal(json.critical + json.blocker, json.count)
    json.issues[0].should.have.property('id')
    issues[0].should.have.property('link')
    issues[0].should.have.property('type')
  } else {
    should.equal(0, json.count)
  }
}
//////////////////// Defect Trend test
describe('reporting/api/alfresco/5.1/defects/open',function(done){
    it('Should get data and store only one entery per day', function(done) {
      this.timeout(15000); // Setting a longer timeout
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/open').end(function(err, res) {
        should.equal(res.status,200)
        var today = new Date()
        var parsedDate = today.getDate() + "/" + (new Number(today.getMonth()) + 1) + "/" + today.getFullYear()
        db.collection('5.1-report').find({
          'dateDisplay': parsedDate
        }).toArray(function(err, result) {
          should(1).be.equal(result.length)
          verifyModel(result[0].open)
          done()
      });
    });
  })
  it('should display results from db',function(done){
   this.timeout(15000); // Setting a longer timeout
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/open').end(
      function(err, res) {
        should.equal(res.status,200)
        var json = res.body
        json.should.have.property('date')
        should.not.exist(json.close)
        json.should.have.property('open')
        verifyModel(json.open)
        json.should.have.property('pending')
        verifyModel(json.pending)
        should.equal(json.total, new Number(json.open.count) + new Number(json.pending.count))
        done()
      });
  })
  it('Should get data and store only one entery per day', function(done) {
    this.timeout(15000); // Setting a longer timeout
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/open').end()
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/defects/open').end(function(err, res) {
      should.equal(res.status,200)
      var today = new Date()
      var parsedDate = today.getDate() + "/" + (new Number(today.getMonth()) + 1) + "/" + today.getFullYear()
      db.collection('5.1-trend').find({
        'dateDisplay': parsedDate
      }).toArray(function(err, result) {
        should(1).be.equal(result.length)
        verifyModel(result[0].open)
        done()
      });
    });
  })

})
