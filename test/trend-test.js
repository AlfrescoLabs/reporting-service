var assert = require('assert')
var expect = require('expect')
var superagent = require('superagent')
var should = require('should')
var app = require('../app')
var config = require('../config')
var db = require('mongoskin').db(config.mongo)
var async = require('async')

describe('reporting/api/alfresco/5.1/tred', function(done) {
  it('Should get data and store only one entery per day', function(done) {
    superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/tred').end(function(err, res) {
      assert(res.status === 200)
      var today = new Date()
      var parsedDate = today.getDate() + "/" + (new Number(today.getMonth()) + 1) + "/" + today.getFullYear()
      db.collection('report').find({
        'dateDisplay': parsedDate
      }).toArray(function(err, result) {
        should(1).be.equal(result.length)
        verifyModel(result[0].open)
        done();
      });
    });
  })
})

describe('reporting/api/alfresco/5.1/tred/dd/mm/yyyy', function(done) {

})
