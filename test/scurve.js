var expect = require('expect')
var superagent = require('superagent')
var scurve = require('../reports/scurve')


var expectedScurve = [
{ date: "1/11/2015", tc: 0},
{ date: "2/11/2015", tc: 1},
{ date: "3/11/2015", tc: 2},
{ date: "4/11/2015", tc: 5},
{ date: "5/11/2015", tc: 10},
{ date: "6/11/2015", tc: 19},
{ date: "7/11/2015", tc: 33},
{ date: "8/11/2015", tc: 49},
{ date: "9/11/2015", tc: 65},
{ date: "10/11/2015",tc: 78},
{ date: "11/11/2015",tc: 87},
{ date: "12/11/2015",tc: 93},
{ date: "13/11/2015",tc: 96},
{ date: "14/11/2015",tc: 98},
{ date: "15/11/2015",tc: 99}
]
//////////////////// SCURVE Projection
describe('reporting/api/alfresco/:version/scurve/:startDate/:endDate/:totalTC',function(done){
    it('Should get array of scurve projection based on start date,end date and total test cases', function(done) {
      this.timeout(15000); // Setting a longer timeout
      var curve = scurve.getScurve('1/11/2015','15/11/2015',99)
      expect(expectedScurve).toEqual(curve)
      done()
    })
})
