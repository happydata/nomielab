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
        $scope.trackers = datapack.trackers;
        // Temp Auto filter
        $scope.vm.filter();
      });
    }; // scope.vm.init()

    $scope.vm.filter = function() {
      WhenIService.findTimesWhenMoreThanUsual({}, function(err, data) {
        console.log("Nice work! if theres data... im in the controller vm.filter", err, data);
      });
    }

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
          self.data = datapack;
          eventQuery = JsonQuery(datapack.events);
          self.data.eventQuery = eventQuery;
          self.analyzeTrackers();
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

      var primaryTracker =

      console.log("Find Times for Tracker "+filter.trackerId, self.generateTrackerStats(filter.trackerId));
      console.log("Compare all", self.findRelatedTrackers(filter.trackerId));


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

    self.findRelatedTrackers = function(trackerId) {
      console.log("Finding related ");
      var related = {
          moreThanToLessThan : [],
          lessThanToMoreThan : [],
          moreThanToMoreThan : [],
          lessThanToLessThan : []
      };
      var tracker = self.data.trackers[trackerId];
      console.log("tracker", tracker);
      for(var t2 in self.data.trackers) {
        var tracker2 = self.data.trackers[t2];

        if(tracker.hasOwnProperty('stats') && tracker2.hasOwnProperty('stats')) {
            var matches = {
              moreThanToLessThan : self.matchTimeSlotArrays(tracker.stats.outliers.moreThanTimes, tracker2.stats.outliers.lessThanTimes),
              lessThanToMoreThan : self.matchTimeSlotArrays(tracker.stats.outliers.lessThanTimes, tracker2.stats.outliers.moreThanTimes),
              moreThanToMoreThan : self.matchTimeSlotArrays(tracker.stats.outliers.moreThanTimes, tracker2.stats.outliers.moreThanTimes),
              lessThanToLessThan : self.matchTimeSlotArrays(tracker.stats.outliers.lessThanTimes, tracker2.stats.outliers.lessThanTimes)
            }
            var clone = angular.copy(tracker2);
            if(matches.moreThanToMoreThan>0) {
              related.moreThanToMoreThan.push({
                tracker : clone,
                count : matches.moreThanToMoreThan
              });
            }


          } else {

          }
      }

      related.moreThanToMoreThan.sort(function(a, b) {
        return b.count - a.count;
      });

      console.log("Related Trackers", related);
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
