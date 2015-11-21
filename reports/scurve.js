/*
 * Create scurve projection data.
 */

module.exports = {
    // getReport: function(req,res){
    //     //TODO ADD Query to mongo to get cycle
    //     var startDate = "16/11/2015"
    //     var endDate = "09/12/2015"
    //     var totaclTC = 3593
    //     var data = {"product":"5.1",
    //                 "run":"1",
    //                 "totalTC":totaclTC,
    //                 "end":"10/11/2015",
    //                 "start":"1/11/2015",
    //                 data:
    //                 [{"id":1,"day":"1/11/2015","tc":"66"},
    //                 {"id":2,"day":"2/11/2015","tc":"44"},
    //                 {"id":3,"day":"3/11/2015","tc":"46"},
    //                 {"id":4,"day":"4/11/2015","tc":"56"},
    //                 {"id":5,"day":"5/11/2015","tc":"77"},
    //                 {"id":6,"day":"6/11/2015","tc":"100"}],
    //                 "scurve": getScurve(startDate,endDate,totaclTC)
    //             };
    //     res.send(data)
    // },
    getScurve: function(startDate, endDate, totalTC){
        var scurve = getScurve(startDate,endDate,totalTC)
        return scurve
    }
}
function parseDateString(date){
    var y = date.split('/')[2];
    var m = date.split('/')[1] - 1;
    var d = date.split('/')[0];
    return new Date(y,m,d);
}
function dateToString(date){
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return d + "/" + m  + "/" + y;
}
function getScurve(startDate,endDate,totaclTC){
    var results=[]
    var days = diff(endDate,startDate) + 1;
    var start = parseDateString(startDate);
      for(i = 0 ; i < days; i++){
          var dateDisplay = new Date(start);
          var t = dateDisplay.setDate(dateDisplay.getDate() +  i)
          var formattedDate = dateToString(new Date(t))
          //DE = Current Day Number of Effort / Total Days in Effort
          var currentDay = i+1;
          var DE = i / days;
          var e = 2.718281828459045
          var result = DE / (DE + Math.pow(e,(3 - 8 * DE)));
          var estimatedTC = Math.round(result * totaclTC);
          results.push({"day" : formattedDate, "tc" : estimatedTC})
      }

      function diff( date1, date2 ) {
        var day1 = parseDateString(date1);
        var day2 = parseDateString(date2);
        // Convert both dates to milliseconds
        var date1_ms = day1.getTime();
        var date2_ms = day2.getTime();
        var diff = date1_ms - date2_ms;
        //1 day in milliseconds
        var aday=1000*60*60*24;
        return diff/aday;
      }
      return results;
}
