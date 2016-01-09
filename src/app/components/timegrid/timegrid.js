angular.module('chartComponents', [])
  .directive('timegrid', function() {

    var pvt = {
      timedata : [],
      timekey : null,
      element : null
    };
    pvt.normalize = function(timeCount) {
      var total = 0;
      var final = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      for(var key in timeCount) {
        total = total + timeCount[key];
      }
      for(var key2 in timeCount) {
        if(timeCount[key2]>0) {
          final[key2] =  (timeCount[key2] / total).toFixed(2);
        }

      }
      return final;
    };

    pvt.render = function(scope, element, attrs) {
      var tableContainer = document.createElement("div");
      tableContainer.className = "timegrid-container";

      var height = (attrs.height) ? attrs.height : 80;
      var cellHeight = height / 8;



      var table = document.createElement("table");
      table.className="timegrid";



      tableContainer.appendChild(table);


      var days = [
        { name : 'Sunday', code : 'Sun', short : 's', timeCount : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0} },
        { name : 'Monday', code : 'Mon', short : 'm', timeCount : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0} },
        { name : 'Tuesday', code : 'Tue', short : 't', timeCount : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0} },
        { name : 'Wednesday', code : 'Wed', short : 'w', timeCount : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0} },
        { name : 'Thursday', code : 'Thu', short : 't', timeCount : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0} },
        { name : 'Friday', code : 'Fri', short : 'f', timeCount : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0} },
        { name : 'Saturday', code : 'Sat', short : 's', timeCount : {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0} }
      ];

      // normalize data
      //console.log("pvt.$scope.timedata", scope.timedata);
      for(var i in scope.timedata) {
        var timerow = scope.timedata[i];
        var thetime = moment(timerow[attrs.timekey]);
        var dayslot = thetime.format('d');
        var timeslot = moment(thetime).format('H');
        var theday = days[dayslot];
        theday.timeCount[timeslot]++
      };

      var hourRow = document.createElement('th');
      var headers = ['12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'];
      for(var h in headers) {
        var cell = document.createElement('td');
        cell.height = cellHeight + 'px';
        cell.textContent = headers[h];
        cell.style.lineHeight = cellHeight + 'px';
        cell.style.fontSize = (cellHeight - (cellHeight * 0.4))+'px';
        hourRow.appendChild(cell);
      }
      table.appendChild(hourRow);

      for(var i in days) {
        var day = days[i];
        var row = document.createElement('tr');
        table.appendChild(row);
        var titletd = document.createElement('td');
        titletd.textContent = day.code;
        titletd.className = day.code + ' day-title';
        titletd.style.fontSize = (cellHeight - (cellHeight * 0.4))+'px';
        row.appendChild(titletd);
        var timeCountNormal = pvt.normalize(day.timeCount);
        for(var nd in timeCountNormal) {
          var timeNode = document.createElement('td');
          timeNode.style.verticalAlign = "center";
          timeNode.style.textAlign = "center";
          timeNode.height = cellHeight + 'px';
          //timeNode.style.opacity = (timeCountNormal[nd]) ? parseFloat(timeCountNormal[nd]) + 0.006 : 0;
          //timeNode.style.background = attrs.color || 'red';
          row.appendChild(timeNode);

          var ball = document.createElement('ball');
          var ballSize = Math.ceil((cellHeight * timeCountNormal[nd]) + (0.2 * cellHeight));
          ball.style.height=ballSize + 'px';
          ball.style.backgroundColor = attrs.color;
          ball.style.width=ballSize + 'px';
          ball.style.borderRadius = (ballSize) ? (ballSize / 2) + 'px' : '50%';
          if(!timeCountNormal[nd]) {
            ball.style.display = 'none';
          }
          timeNode.appendChild(ball);

        }

      }
      //console.log("REPLACING THIS ELEMENT", element);
      element[0].innerHTML = (tableContainer.innerHTML);
    }

    return {
        restrict: 'E',
        scope : {
          timedata: '=timedata'
        },
        link: function(scope, element, attrs) {
          pvt.element = element;
          pvt.attrs = attrs;
          //return function($scope) {
            scope.$watch('timedata', function() {
              if(scope.timedata.length>0) {
                pvt.render(scope, element, attrs);
              }
            });
          //}
        }
    };
})
