var hack;
/**
 * Nomie WhenI Module
 * @namespace WhenIModule
 */
NomieLabApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/when', {
    templateUrl		: './app/modules/when-i/when-i.html',
    controller		: 'WhenIController',
  });
});

/**
 * Nomie WhenI Controller
 * @memberof WhenIModule
 * @namespace WhenIController
 */
NomieLabApp
	.controller('WhenIController', ['$scope', '$rootScope', '$timeout', 'WhenIService','$interval',
	function ($scope, $rootScope, $timeout, WhenIService,$interval) {
		$scope.vm = {};

    $scope.vm.WhenI = {
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
      WhenIService.init(function(err, datapack){
        console.log("WhenIService Init", datapack);
        $timeout(function() {
          $scope.vm.trackers = datapack.trackers;
          $scope.vm.trackerArray = function(trackerObjs) {
            var r = [];
            for(var i in trackerObjs) {
              r.push(trackerObjs[i]);
            }
            return r;
          }(datapack.trackers);
        },120);
        // Temp Auto filter
      });
    }; // scope.vm.init()

    $scope.vm.selectedTracker = null;
    $scope.vm.selectTracker = function(tracker) {
      $scope.vm.selectedTracker = tracker;
      $scope.vm.related = WhenIService.findRelatedTrackers(tracker._id, 10);
      console.log("Related to "+tracker.label+" ", $scope.vm.related);
    };

    // $scope.vm.filter = function() {
    //   WhenIService.findTimesWhenMoreThanUsual({}, function(err, data) {
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
 * Nomie WhenI Service
 * @memberof WhenIModule
 * @namespace WhenIService
 */
NomieLabApp
	.service('WhenIService', [ '$rootScope', '$timeout', 'BaseService',
	function ($rootScope, $timeout, BaseService) {
		var self = this;
    self.data = {};

    self.init = function(callback) {
      NomieLab.currentDatasource.getAllData(function(err, datapack) {
        console.log("NomieLab.currentDatasource.getAllData()", err, datapack);
          self.data = datapack;
          eventQuery = JsonQuery(datapack.events);
          self.data.eventQuery = eventQuery;

          self.analyzeTrackers();``
          console.log("WhenIService init()", self.data);
          callback(null, self.data);
      });
    }; //self.init

    self.analyzeTrackers = function() {
      for(var i in self.data.trackers) {
        self.data.trackers[i].stats = self.generateTrackerStats(i);
      }
    }

    self.findTimesWhenMoreThanUsual = function(filter, callback) {

      filter = filter || {};
      filter.trackerId = filter.trackerId || "151b198daba1483bb319e16e3aef0649";

    //  console.log("Find Times for Tracker "+filter.trackerId, self.generateTrackerStats(filter.trackerId));
      //console.log("Compare all", self.findRelatedTrackers(filter.trackerId));


    }; // end findTimesWhenMoreThanUsual

    self.generateTrackerStats = function(trackerId) {
      var filter = {};
      filter.trackerId = trackerId;

      var events = self.data.eventQuery.where({'parent' : filter.trackerId}).exec();
      var eventCounts = {};
      for(var i in events) {
        var event = events[i];
        var time = moment(event.time).startOf('day').toDate().getTime();
        if(eventCounts.hasOwnProperty(time)) {
          eventCounts[time]++;
        } else {
          eventCounts[time]=1;
        }
      }
      var eachDay = self.fillInCalendar(eventCounts);
      var eachDayAverage = Math.ceil(jStat.mean(self.toValueArray(eachDay)));
      var eachDayMax = Math.ceil(jStat.max(self.toValueArray(eachDay)));
      var eachDayMin = Math.floor(jStat.min(self.toValueArray(eachDay)));
      var variance = 0.4;

      var outliers = {
        moreThanTimes : [],
        lessThanTimes : []
      }

      for(var o in eachDay) {
        if(eachDay[o] > (eachDayAverage+(eachDayAverage*variance))) {
          outliers.moreThanTimes.push({ time : parseInt(o), value: eachDay[o]});
        } else if(eachDay[o] < (eachDayAverage-(eachDayAverage*variance))) {
          outliers.lessThanTimes.push({ time : parseInt(o), value: eachDay[o]});
        }
      }

      var trackerData = {
        eachDay : eachDay,
        eachDayAvg : eachDayAverage,
        eachDayMax : eachDayMax,
        eachDayMin : eachDayMin,
        outliers : outliers
      };

      return trackerData;
    };

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

    self.fillInCalendar = function(timeSlotArray) {
      var times = Object.keys(timeSlotArray);
      var start = moment(parseInt(times[0]));
      var end = moment(parseInt(times[times.length-1]));
      var diff = end.diff(start, 'days');
      for(var i=0;i<diff;i++) {
        var timestamp = moment(start).add(i,'days').toDate().getTime();
        if(!timeSlotArray.hasOwnProperty(timestamp)) {
          timeSlotArray[timestamp]=0;
        }
      }
      return timeSlotArray;
    }
    self.toValueArray = function(timeSlotArray) {
      var rarr = [];
      for(var i in timeSlotArray) {
        rarr.push(timeSlotArray[i]);
      }
      return rarr;
    }


		return self;
	} // end main home service function
]);
