var assert = require('assert')
var expect = require('expect')
var superagent = require('superagent')
var should = require('should')
var app = require('../app')
var config = require('../config')
var db = require('mongoskin').db(config.mongo)


var expectedScurve = [
{ day: "1/11/2015", tc: 0},
{ day: "2/11/2015", tc: 1},
{ day: "3/11/2015", tc: 2},
{ day: "4/11/2015", tc: 5},
{ day: "5/11/2015", tc: 10},
{ day: "6/11/2015", tc: 19},
{ day: "7/11/2015", tc: 33},
{ day: "8/11/2015", tc: 49},
{ day: "9/11/2015", tc: 65},
{ day: "10/11/2015",tc: 78},
{ day: "11/11/2015",tc: 87},
{ day: "12/11/2015",tc: 93},
{ day: "13/11/2015",tc: 96},
{ day: "14/11/2015",tc: 98},
{ day: "15/11/2015",tc: 99}
]
//////////////////// SCURVE Projection
describe('reporting/api/alfresco/:version/scurve/:startDate/:endDate/:totalTC',function(done){
    it('Should get array of scurve projection based on start date,end date and total test cases', function(done) {
      this.timeout(15000); // Setting a longer timeout
      superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/scurve/1/11/2015/16/11/2015/100').end(function(err, res) {
        assert(res.status === 200)
        expect(expectedScurve).toEqual(res.body)
        done()
      })
    })
})
describe('It should be able to create, update and find an scurve entry',function(done){
    it('Should create a entry in mongo', function(done) {
        superagent.post('http://localhost:3000/reporting/api/alfresco/5.1/1/scurve')
            .send({field: "Test string."})
            .end(function(error,res){
                assert(res.status === 200)
                done()
        })
    })
    it('Should get an entry in mongo', function(done) {
        superagent.get('http://localhost:3000/reporting/api/alfresco/5.1/1/scurve')
            .end(function(error,res){
            assert(res.status === 200)
            var json = res.body

            json.should.have.property('name')
            json.should.have.property('run')
            json.should.have.property('start')
            json.should.have.property('end')
            json.should.have.property('totalTC')

            done()
        })
    })
})
