var hack;
/**
 * Nomie Compare Module
 * @namespace CompareModule
 */
NomieLabApp.config(function ($routeProvider, $locationProvider) {
	$routeProvider
		.when('/compare', {
			templateUrl: './app/modules/compare/compare.html',
			controller: 'CompareController',
		});
});

/**
 * Nomie Compare Controller
 * @memberof CompareModule
 * @namespace CompareController
 */
NomieLabApp
	.controller('CompareController', ['$scope', '$rootScope', '$timeout', 'CompareService', '$interval', 'BaseService',
		function ($scope, $rootScope, $timeout, CompareService, $interval, BaseService) {
			$scope.vm = {};
			var pvt = {};

			/** Setup Map **/

			$scope.vm.init = function () {
				CompareService.init(function (err, datapack) {
					//console.log("CompareService Init", datapack);
					$timeout(function () {
						$scope.vm.trackers = datapack.trackers;
						$scope.vm.trackerArray = datapack.trackerArray;
					}, 120);
					// Temp Auto filter
				});
			}; // scope.vm.init()

			$scope.vm.selectedTrackers = [];
			$scope.vm.toggleTracker = function (tracker) {
				tracker.selected = !tracker.selected;
				$scope.vm.trackerChange();
			};

      $scope.vm.timeSample = [];

      function randomDate(start, end) {
          return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      }

      for(var o = 0; o < 1000; o++) {
          $scope.vm.timeSample.push({ time : randomDate(new Date(2016, 0, 1), new Date()) });
      }


      $scope.vm.unselectAll = function() {
        for (var i in $scope.vm.selectedTrackers) {
					delete($scope.vm.selectedTrackers[i].selected);
				}
        $scope.vm.selectedTrackers = [];
        pvt.renderView();
      }

      $scope.vm.getSize = function(maxSize, percent) {
        return (percent / 100) * maxSize;
      };

			$scope.vm.trackerChange = function () {
				$scope.vm.selectedTrackers = [];
				//console.log("Tracker Select Change Detected");
				for (var i in $scope.vm.trackers) {
					if ($scope.vm.trackers[i].selected) {
						if (!$scope.vm.trackers[i].hasOwnProperty('stats')) {
							$scope.vm.trackers[i].stats = BaseService.generateTrackerStats($scope.vm.trackers[i]._id, CompareService.query.events);
						}
						$scope.vm.selectedTrackers.push($scope.vm.trackers[i]);

					}
				}
				pvt.renderView();
			};

			pvt.renderView = function () {
				$scope.vm.chartData = [];
				//console.log("Rendering View", $scope.vm.selectedTrackers);
				pvt.renderChart();
			};
			pvt.getSelectedTrackerIds = function () {
				var ids = [];
				for (var i in $scope.vm.selectedTrackers) {
					ids.push($scope.vm.selectedTrackers[i]._id);
				}
				return ids;
			}

			pvt.getSelectedTrackerColors = function () {
				var colors = {};
				for (var i in $scope.vm.selectedTrackers) {
					colors[$scope.vm.selectedTrackers[i]._id] = $scope.vm.selectedTrackers[i].color;
				}
				return colors;
			}
			pvt.getSelectedTrackerNames = function () {
				var names = {};
				for (var i in $scope.vm.selectedTrackers) {
					names[$scope.vm.selectedTrackers[i]._id] = $scope.vm.selectedTrackers[i].label;
				}
				return names;
			}

			pvt.chartData = [];

			/**
			 * Private - pvt.renderChart()
			 * @return {object} [description]
			 */
			pvt.renderChart = function () {

				pvt.chartData = [];

				var chartEvents = CompareService.query.events.where({
					'parent.$in': pvt.getSelectedTrackerIds()
				}).exec();

				pvt.compareChart = c3.generate({
					bindto: '#chart-container',
					data: {
						json: pvt.chartData,
						type: $scope.vm.chartType
					},
          legend: {
              show: false
          },
          axis: {
						x: {
							type: 'timeseries',
              tick : {
                format : '%Y-%m-%d'
              }
						}
					},
					zoom: {
						enabled: true,
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

				});
        $timeout(function() {
          pvt.toChartData(chartEvents);
        },100);


			}; // end pvt.renderChart();

      $scope.vm.trackerStatClick = function(tracker) {
        pvt.compareChart.toggle(tracker._id);
        tracker.hidden = !tracker.hidden;
      }
      $scope.vm.trackerStatHover = function(tracker) {
        pvt.compareChart.focus(tracker._id);
      }
      $scope.vm.trackerStatBlur = function(tracker) {
        pvt.compareChart.revert();
      }

      $scope.vm.mode = "day";
      $scope.vm.timeSlotFormat = "YYYYMMDD";

      $scope.vm.setChartTimeMode = function(mode) {
          switch(mode) {
            case 'day' :
              $scope.vm.mode = "day";
              $scope.vm.timeSlotFormat = "YYYYMMDD";
              $scope.vm.chartType = "area-spline";
            break;
            case 'week' :
              $scope.vm.mode = "week";
              $scope.vm.timeSlotFormat = "YYYYww";
              $scope.vm.chartType = "area-spline";
            break;
            case 'month' :
              $scope.vm.mode = "month";
              $scope.vm.timeSlotFormat = "YYYYMM";
            break;
          }
          $timeout(function() {
            pvt.renderChart();
          },100);
      }

      $scope.vm.toggleChartMode = function() {
        if($scope.vm.chartType == "bar") {
          $scope.vm.chartType = "area-spline";
        } else {
          $scope.vm.chartType = "bar";
        }
        pvt.renderChart();
      }

			/**
			 * pvt.toChartData
			 * @description Generate C3 Data Format For Charts. It's a little crazy.
			 */
			pvt.toChartData = function (events) {
				//console.log("To Chart Data", events);
				var selectedTrackers = pvt.getSelectedTrackerIds();
				var timeSlots = {};


				var mfirst = moment(events[0].time);
				var mlast = moment(events[events.length - 1].time);
				var diff = mlast.diff(mfirst, $scope.vm.mode);

				for (var dc = 0; dc < diff; dc++) {
					var slot = mfirst.add(1, $scope.vm.mode).format($scope.vm.timeSlotFormat);
					timeSlots[slot] = {
						time: mfirst.format('YYYY-MM-DD')
					};
					for (var t in selectedTrackers) {
						timeSlots[slot][selectedTrackers[t]] = 0;
					}
				}

				//console.log("Timeslots Prefilled", timeSlots);

				for (i in events) {
					var event = events[i];
					var eventSlot = moment(event.time).format($scope.vm.timeSlotFormat);
					if (timeSlots.hasOwnProperty(eventSlot)) {
						timeSlots[eventSlot][event.parent]++;
					}
				}

				var responseData = [];
				for (var ts in timeSlots) {
					responseData.push(timeSlots[ts]);
				}

				//console.log("#### TIME SLOTS #####", responseData);



				var chartDataPack = {
					json: responseData,
					keys: {
						x: 'time',
						value: pvt.getSelectedTrackerIds(),
					},
					colors: pvt.getSelectedTrackerColors(),
					names: pvt.getSelectedTrackerNames(),
          groups : pvt.getSelectedTrackerIds()
				};

				//console.log("Chart Data Pack", chartDataPack);
        hack = pvt.compareChart;
				pvt.compareChart.load(chartDataPack);
        if($scope.vm.chartMode == "bar") {
          pvt.compareChart.axis.x.type = 'category';
        } else {
          // pvt.compareChart.axis = null;
        }


				return responseData;
			}; //end pvt.toTimeChartData;

			// $scope.vm.filter = function() {
			//   CompareService.findTimesWhenMoreThanUsual({}, function(err, data) {
			//     //console.log("Nice work! if theres data... im in the controller vm.filter", err, data);
			//   });
			// }

			//Load and Reload when needed
			$rootScope.$on('datasource-selected', function (event, datasource) {
				$scope.vm.init();
			});
			$timeout(function () {
				$scope.vm.init();
			}, 1000);

		} // end main home controller function
	]);

/**
 * Nomie Compare Service
 * @memberof CompareModule
 * @namespace CompareService
 */
NomieLabApp
	.service('CompareService', ['$rootScope', '$timeout', 'BaseService',
		function ($rootScope, $timeout, BaseService) {
			var self = this;
			self.data = {};
			self.query = {
				events: null,
				trackers: null
			}
			self.init = function (callback) {
				NomieLab.currentDatasource.getAllData(function (err, datapack) {
					//console.log("NomieLab.currentDatasource.getAllData()", err, datapack);
					self.data = datapack;
					self.query.events = JsonQuery(datapack.events);
					self.query.trackers = JsonQuery(datapack.trackers);
					//console.log("CompareService init() COMPLETE... LETS GO!", self.data);
					callback(null, self.data);
				});
				return self;
			}; //self.init



			return self;
		} // end main home service function
	]);
