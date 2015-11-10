var assert = require('assert')
var expect = require('expect')
var superagent = require('superagent')
var should = require('should')
var app = require('../app')
var config = require('../config')
var db = require('mongoskin').db(config.mongo)
var async = require('async')

var expectedScurve = [
  { day: 1, tc: 0 },
  { day: 2, tc: 1 },
  { day: 3, tc: 6 },
  { day: 4, tc: 19 },
  { day: 5, tc: 44 },
  { day: 6, tc: 70 },
  { day: 7, tc: 87 },
  { day: 8, tc: 95 },
  { day: 9, tc: 98 } ];
//////////////////// SCURVE Projection
describe('reporting/api/alfresco/:version/scurve/:startDate/:endDate/:totalTC',function(done){
    it('Should get array of scurve projection based on start date,end date and total test cases', function(done) {
      this.timeout(15000); // Setting a longer timeout
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/scurve/1/11/2015/10/11/2015/100').end(function(err, res) {
        assert(res.status === 200)
        expect(res.body).toEqual(expectedScurve)
        done()
      });
    });
})
