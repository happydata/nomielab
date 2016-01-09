/**
 * Nomie Dashboard Module
 * @namespace DashboardModule
 */
NomieLabApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/dashboard', {
    templateUrl		: './app/modules/dashboard/dashboard.html',
    controller		: 'DashboardController',
  });
});

/**
 * Nomie Dashboard Controller
 * @memberof DashboardModule
 * @namespace DashboardController
 */
NomieLabApp
	.controller('DashboardController', ['$scope', '$rootScope', '$timeout', 'DashboardService',
	function ($scope, $rootScope, $timeout, DashboardService) {
		$scope.vm = {};
    $scope.vm.dashboard = {
      trackers : {
        count : 0,
        data : [],
      },
      notes : {
        count : 0,
        data: []
      },
      events : {
        count : 0,
        data : []
      }
    };

    $scope.user = {
      firstName : 'Brandon',
      lastName : 'Corbin'
    };

    $scope.vm.totalChart = {
      eventCounts : [],
      theChart : null

    };




    var renderTotalChart = function(events) {

      // Go by the hour
      var hourmap = {};
      var slotFormat = "YYYYMMDD";
      for(var i in events) {
        var slot = moment(events[i].time).startOf('day').toDate().getTime();
        if(hourmap.hasOwnProperty(slot)) {
          hourmap[slot].total++;
          if(events[i].charge>0) {
            hourmap[slot].positive++;
          } else if(events[i].charge<0) {
            hourmap[slot].negative++;
          }
        } else {
          hourmap[slot] = {
            time : slot,
            total : 1,
            positive : (events[i].charge>0) ? 1 : 0,
            negative : (events[i].charge<0) ? 1 : 0
          }
        }
      }

      var chartData = [];
      for(var hi in hourmap) {
        chartData.push({
          time : hourmap[hi].time,
          positive : hourmap[hi].positive,
          negative : hourmap[hi].negative,
          total : hourmap[hi].total
        });
      }

      $scope.vm.totalChart = c3.generate({
          bindto: '#overview-totals-chart',
          data: {
            selection: {
              draggable: true,
              enabled : true
            },
            // type : 'line',
            json : chartData,
            keys : {
              x : 'time',
              value : ["total","positive","negative"],
            },
            colors : {
              "count" : "rgba(125, 131, 130, 0.7)",
              "positive" : "rgb(5, 163, 21)",
              "negative" : "rgb(140, 49, 49)"
            },
            type : 'area-spline'
          },
          zoom : {
            enabled : true,
            rescale: true,
            extent: [80, 100] // enable more zooming
          },
          subchart: {
              show: true,
              extent: [80, 100],
              size: {
                height: 20
              }
          },
          point: {
              show: false
          },
          bar: {
              width: { ratio: 0.9 }
          },
          axis: {
              x: {

                  type: 'timeseries',
                  tick: {
                      // culling : {
                      //   max : 10
                      // },
                      // format: '%Y-%m-%d'
                  }
              }
          }
      });
    }; // end renderTotalChart;

    $scope.vm.init = function() {



      NomieLab.currentDatasource.getAllData(function(err, datapack) {
        $timeout(function() {
          $scope.vm.dashboard.trackers.count = Object.keys(datapack.trackers).length;
          $scope.vm.dashboard.trackers.data = datapack.trackers;
          $scope.vm.dashboard.notes.count = datapack.notes.length;
          $scope.vm.dashboard.notes.data = datapack.notes;
          $scope.vm.dashboard.events.count = datapack.events.length;
          $scope.vm.dashboard.events.data = datapack.events;
          renderTotalChart(datapack.events);
        });
      })

      console.log("Analsis",NomieLab.currentDatasource);
      NomieLab.currentDatasource.analysis.CorbinGeneral(function(err, data) {
        $timeout(function() {
          $scope.vm.analysis = data;
          console.log("CorbinGeneral Analysis Callback", err, data);

          var chargeChart = c3.generate({
              bindto: '#dashboard-chart-pie',
              data: {
                type : 'pie',
                columns: [
                  ['positive', $scope.vm.analysis.events.positive],
                  ['negative', $scope.vm.analysis.events.negative],
                  ['neutral', $scope.vm.analysis.events.neutral],
                ]
              }
          });

          var dowChart = c3.generate({
              bindto: '#dashboard-dow-pie',
              data: {
                type : 'bar',
                columns: [
                  ['Monday', $scope.vm.analysis.events.byDay.Mon || 0],
                  ['Tuesday', $scope.vm.analysis.events.byDay.Tue || 0],
                  ['Wednesday', $scope.vm.analysis.events.byDay.Wed || 0],
                  ['Thursday', $scope.vm.analysis.events.byDay.Thu || 0],
                  ['Friday', $scope.vm.analysis.events.byDay.Fri || 0],
                  ['Satday', $scope.vm.analysis.events.byDay.Sat || 0],
                  ['Sunday', $scope.vm.analysis.events.byDay.Sun || 0],
                ]
              },
              donut : {
                title : "Day of Week"
              }
          });


        });
      });



    }; // scope.vm.init()



    //Load and Reload when needed
    $rootScope.$on('datasource-selected', function(event, datasource) {
      $scope.vm.init();
    });
    $timeout(function() {
      $scope.vm.init();
    },400);

	} // end main home controller function
]);
/**
 * Nomie Dashboard Service
 * @memberof DashboardModule
 * @namespace DashboardService
 */
NomieLabApp
	.service('DashboardService', [ '$rootScope', '$timeout', 'BaseService',
	function ($rootScope, $timeout, BaseService) {
		var self = this;



		return self;
	} // end main home service function
]);
