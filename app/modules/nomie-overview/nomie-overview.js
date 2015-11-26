/**
 * Nomie Overview Module
 * @namespace OverviewModule
 */
NomieLabApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/overview', {
    templateUrl		: './app/modules/nomie-overview/nomie-overview.html',
    controller		: 'OverviewController',
  });
});

/**
 * Nomie Overview Controller
 * @memberof OverviewModule
 * @namespace OverviewController
 */
NomieLabApp
	.controller('OverviewController', ['$scope', '$rootScope', '$timeout', 'OverviewService',
	function ($scope, $rootScope, $timeout, OverviewService) {
		$scope.vm = {};
    $scope.vm.overview = {
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
    $scope.vm.init = function() {


      NomieLab.currentDatasource.getAllData(function(err, datapack) {
        $timeout(function() {
          $scope.vm.overview.trackers.count = Object.keys(datapack.trackers).length;
          $scope.vm.overview.trackers.data = datapack.trackers;
          $scope.vm.overview.notes.count = datapack.notes.length;
          $scope.vm.overview.notes.data = datapack.notes;
          $scope.vm.overview.events.count = datapack.events.length;
          $scope.vm.overview.events.data = datapack.events;
        });
      })

      console.log("Analsis",NomieLab.currentDatasource);
      NomieLab.currentDatasource.analysis.CorbinGeneral(function(err, data) {
        $timeout(function() {
          $scope.vm.analysis = data;
          console.log("CorbinGeneral Analysis Callback", err, data);

          var chargeChart = c3.generate({
              bindto: '#overview-chart-pie',
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
              bindto: '#overview-dow-pie',
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
 * Nomie Overview Service
 * @memberof OverviewModule
 * @namespace OverviewService
 */
NomieLabApp
	.service('OverviewService', [ '$rootScope', '$timeout', 'BaseService',
	function ($rootScope, $timeout, BaseService) {
		var self = this;

		return self;
	} // end main home service function
]);
