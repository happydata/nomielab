var hack;
/**
 * Nomie TrackerDetail Module
 * @namespace TrackerDetailModule
 */
NomieLabApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/tracker-detail', {
    templateUrl		: './app/modules/tracker-detail/tracker-detail.html',
    controller		: 'TrackerDetailController',
  }).when('/tracker-detail/:id', {
   templateUrl		: './app/modules/tracker-detail/tracker-detail.html',
   controller		: 'TrackerDetailController',
 });
});

/**
 * Nomie TrackerDetail Controller
 * @memberof TrackerDetailModule
 * @namespace TrackerDetailController
 */
NomieLabApp
	.controller('TrackerDetailController', ['$scope', '$rootScope', '$timeout', 'TrackerDetailService','$interval','$routeParams',
	function ($scope, $rootScope, $timeout, TrackerDetailService,$interval,$routeParams) {
		$scope.vm = {};

    $scope.vm.TrackerDetail = {
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

    /** Setup Map **/


    $scope.vm.init = function() {

      TrackerDetailService.init(function(err, datapack){
        console.log("TrackerDetailService Init", datapack);
        $timeout(function() {
          $scope.vm.trackers = datapack.trackers;
          $scope.vm.trackerArray = function(trackerObjs) {
            var r = [];
            for(var i in trackerObjs) {
              r.push(trackerObjs[i]);
            }
            return r;
          }(datapack.trackers);

          if($routeParams.id) {
            $scope.vm.selectTracker(datapack.trackers[$routeParams.id]);
          }

        },120);
        // Temp Auto filter
      });
    }; // scope.vm.init()

    $scope.vm.selectedTracker = null;
    $scope.vm.selectTracker = function(tracker) {
      console.log("Tracker Selected", tracker);
      $scope.vm.selectedTracker = tracker;
      //$scope.vm.related = TrackerDetailService.findRelatedTrackers(tracker._id, 10);
      //console.log("Related to "+tracker.label+" ", $scope.vm.related);
    };

    // $scope.vm.filter = function() {
    //   TrackerDetailService.findTimesWhenMoreThanUsual({}, function(err, data) {
    //     console.log("Nice work! if theres data... im in the controller vm.filter", err, data);
    //   });
    // }

    //Load and Reload when needed
    $rootScope.$on('datasource-selected', function(event, datasource) {
      $scope.vm.init();
    });
    $timeout(function() {
      $scope.vm.init();
    },1000);

	} // end main home controller function
]);






/**
 * Nomie TrackerDetail Service
 * @memberof TrackerDetailModule
 * @namespace TrackerDetailService
 */
NomieLabApp
	.service('TrackerDetailService', [ '$rootScope', '$timeout', 'BaseService',
	function ($rootScope, $timeout, BaseService) {
		var self = this;
    self.data = {};

    self.init = function(callback) {
      NomieLab.currentDatasource.getAllData(function(err, datapack) {
      //  console.log("NomieLab.currentDatasource.getAllData()", err, datapack);
          self.data = datapack;
          eventQuery = JsonQuery(datapack.events);
          self.data.eventQuery = eventQuery;

          self.analyzeTrackers();``
        //  console.log("TrackerDetailService init()", self.data);
          callback(null, self.data);
      });
    }; //self.init

    self.analyzeTrackers = function() {
      for(var i in self.data.trackers) {
        self.data.trackers[i].stats = self.generateTrackerStats(i, self.data.eventQuery);
      }
    }

    self.findTimesWhenMoreThanUsual = function(filter, callback) {

      filter = filter || {};
      filter.trackerId = filter.trackerId || "151b198daba1483bb319e16e3aef0649";

    //  console.log("Find Times for Tracker "+filter.trackerId, self.generateTrackerStats(filter.trackerId));
      //console.log("Compare all", self.findRelatedTrackers(filter.trackerId));


    }; // end findTimesWhenMoreThanUsual

    self.generateTrackerStats = BaseService.generateTrackerStats;

    self.compareAll = function() {

      for(var t in self.data.trackers) {
        var tracker = self.data.trackers[t];
        for(var t2 in self.data.trackers) {
          if(t2 != tracker._id) {
            var tracker2 = self.data.trackers[t2];
            console.log("Compare "+tracker.label + " to " + tracker2.label);
          }
        }
      } //end initial loop over trackers

    }; //self.compareAll

    /**
     * Find Related Trackers
     * @param  {string} trackerId A Tracker ID To compare
     * @param  {numeric} limit     optional number to limit result count`
     */
    self.findRelatedTrackers = function(trackerId, limit) {
      limit = limit || null;

      var related = {
          moreThanToLessThan : [],
          lessThanToMoreThan : [],
          moreThanToMoreThan : [],
          lessThanToLessThan : []
      };
      var tracker = self.data.trackers[trackerId];

      // Loop over all trackers
      for(var t2 in self.data.trackers) {
        // This compare Tracker
        var tracker2 = self.data.trackers[t2];
        // If it both trackers have the stats property, and both trackers are different.
        if(tracker.hasOwnProperty('stats') && tracker2.hasOwnProperty('stats') && (tracker2._id != tracker._id)) {
            /**
             * Populate Matches
             * The idea is to find the average for a tracker, find days that are higher and days that are lower
             * and compare that to other trackers. If we have more of tracker 1 and tracker 2.. That goes to the
             * more and more,,, less of tracker 1 and more of tracker 2. That goes to the Less Than More Than...
             */
            var matches = {
              moreThanToLessThan : self.matchTimeSlotArrays(tracker.stats.outliers.moreThanTimes, tracker2.stats.outliers.lessThanTimes),
              lessThanToMoreThan : self.matchTimeSlotArrays(tracker.stats.outliers.lessThanTimes, tracker2.stats.outliers.moreThanTimes),
              moreThanToMoreThan : self.matchTimeSlotArrays(tracker.stats.outliers.moreThanTimes, tracker2.stats.outliers.moreThanTimes),
              lessThanToLessThan : self.matchTimeSlotArrays(tracker.stats.outliers.lessThanTimes, tracker2.stats.outliers.lessThanTimes)
            }
            //matches.lessLessMoreMore =
            var clone = angular.copy(tracker2); //Get its own copy to work with.
            if(matches.moreThanToMoreThan>0) {
              related.moreThanToMoreThan.push({
                tracker : clone,
                count : matches.moreThanToMoreThan
              });
            }
            if(matches.moreThanToLessThan>0) {
              related.moreThanToLessThan.push({
                tracker : clone,
                count : matches.moreThanToLessThan
              });
            }
            if(matches.lessThanToMoreThan>0) {
              related.lessThanToMoreThan.push({
                tracker : clone,
                count : matches.lessThanToMoreThan
              });
            }
            if(matches.lessThanToLessThan>0) {
              related.lessThanToLessThan.push({
                tracker : clone,
                count : matches.lessThanToLessThan
              });
            }

          } else {
            // Nothing
          }
      }
      // Sort by the highest variances
      related.moreThanToMoreThan.sort(function(a, b) {
        return b.count - a.count;
      });
      related.moreThanToLessThan.sort(function(a, b) {
        return b.count - a.count;
      });
      related.lessThanToMoreThan.sort(function(a, b) {
        return b.count - a.count;
      });
      related.lessThanToLessThan.sort(function(a, b) {
        return b.count - a.count;
      });
      // Slice the array if the user only wants a certain limited number.
      if(limit) {
        related.moreThanToMoreThan = related.moreThanToMoreThan.slice(0,limit);
        related.moreThanToLessThan = related.moreThanToLessThan.slice(0,limit);
        related.lessThanToMoreThan = related.lessThanToMoreThan.slice(0,limit);
        related.lessThanToLessThan = related.lessThanToLessThan.slice(0,limit);
      }
      return related;
    }

    self.matchTimeSlotArrays = function(arr1, arr2) {
      var matches = 0;
      for(var i in arr1) {
        var time = arr1[i].time;
        for(var o in arr2) {
          var time2 = arr2[o].time;

          if(time == time2) {
            matches++;
          }
        }
      }
      return matches;
    };

    self.fillInCalendar = BaseService.fillInCalendar;
    self.toValueArray = BaseService.toValueArray;


		return self;
	} // end main home service function
]);
