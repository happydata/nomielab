
/**
 * Base MODULE
 * @namespace Base
 */

 /**
  * Base Controller
  * @memberof Base
  * @namespace BaseController
  */
angular
	.module('BaseModule', [])
	.controller('BaseController', ['$scope', '$rootScope', '$timeout', 'BaseService', '$location',
	function ($scope, $rootScope, $timeout, BaseService, $location) {

		$rootScope.vm = {};
    $rootScope.newDatasource = BaseService.datasourceStub();

    // Datasource Setup and Saving
    $rootScope.addDatasource = function() {
      $('#add-datasource-modal').slideDown();
    }
    $rootScope.cancelNewDatasource = function() {
      $('#add-datasource-modal').slideUp();
    }
    $rootScope.selectDatasource = BaseService.selectDatasource;

    $rootScope.saveDatasource = function() {
      console.log("######## VM.SAVEDATASOURCE() ########");
      $timeout(function() {
        BaseService.saveDatasource($rootScope.newDatasource, function(err, data) {
          if(err===null) {
            NomieLab.notify.success("Datasource Successfully Saved");
            $timeout(function() {
              $rootScope.datasources = NomieLab.datasources.getAll();
            });
          } else {
            NomieLab.notify.error("Adding Datasource Failed. Reason: "+err.message);
          }
        });
      });
    } // $scope.vm.saveDatasource()

    /**
     * Checks to see if the path is the current one.
     * If it is, it will return an active class.
     * <a href="#/home" ng-class="getClass('/home')">
     * @param  {string} path url path
     * @return {string}      active or ''
     */
    $rootScope.getClass = function (path) {
      if ($location.path().substr(0, path.length) === path) {
        return 'active';
      } else {
        return '';
      }
    }

	} // end main Base controller function
]);


/**
 * Base Service
 * @ngdoc service
 * @name BaseService
 * @description
 * 	Handles initial setup of the Nomie Lab Enviornment
 */
angular
	.module('BaseModule')
	.service('BaseService', [ '$rootScope', '$timeout', '$http',
	function ($rootScope, $timeout, $http) {
		var self = this;
    var pvt = {};

    /**
     * Initializes the BaseService
     * @return {object}  BaseService
     */
    self.init = function() {
      $timeout(function() {
        $rootScope.datasources = NomieLab.datasources.getAll();
        if(NomieLab.storage.get('currentDatasource')) {
          NomieLab.currentDatasource = new NomieLabDatasource(NomieLab.storage.get('currentDatasource'));
          $rootScope.currentDatasource = NomieLab.currentDatasource;
        } else {
          NomieLab.currentDatasource = null;
        }
      },100);
      return self;
    }();

    self.locations = {
      cached : {},
      getLocation : function(lat,lng, callback) {
        $http({
          method: 'GET',
          url: ' http://nominatim.openstreetmap.org/reverse?format=json&lat='+lat+'&lon='+lng+'&zoom=18&addressdetails=1'
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            console.log("Location Lookup", response);
            callback(null, response.data);
          }, function errorCallback(err) {
            callback(err, null);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });
      }
    }

    /**
     * Sets a current Datasource
     * @param  {object} datasource A datasource js object
     * @return {boolean}            [description]
     */
    self.selectDatasource = function(datasource) {
      console.log("### $rootScope.selectDatasource", datasource);
      NomieLab.currentDatasource = new NomieLabDatasource(datasource);
      $rootScope.currentDatasource = NomieLab.currentDatasource;
      $rootScope.$broadcast('datasource-selected', datasource);
      NomieLab.storage.set('currentDatasource', datasource);
      $timeout(function() {
        document.location.reload();
      },120)
    }

    self.selectTrackers = function(options) {
      options = options || {};
      options.callback = options.callback || function(err, trackers) {
        console.log("## base.js ## self.selectTracker ## No Callback Profied options.callback == null");
      }

    };

    self.fillInCalendar = function(timeSlotArray, mode) {
      mode = mode || 'days';
      var times = Object.keys(timeSlotArray);
      var start = moment(parseInt(times[0]));
      var end = moment(parseInt(times[times.length-1]));
      var diff = end.diff(start, mode);
      for(var i=0;i<diff;i++) {
        var timestamp = moment(start).add(i,mode).toDate().getTime();
        if(!timeSlotArray.hasOwnProperty(timestamp)) {
          timeSlotArray[timestamp]=0;
        }
      }
      return timeSlotArray;
    };

    self.toValueArray = function(timeSlotArray) {
      var rarr = [];
      for(var i in timeSlotArray) {
        rarr.push(timeSlotArray[i]);
      }
      return rarr;
    };

    self.averageKeyValue = function(obj, fixed) {
        fixed = fixed || 1
        var newObj = {};
        var total = 0;
        for(var key in obj) {
          total = total + obj[key];
        }
        for(var key in obj) {
          newObj[key] = parseFloat(((obj[key] / total) * 100).toFixed(fixed));
        }
        return newObj;
    }

    self.generateTrackerStats = function(trackerId, queryObject) {
      var filter = {};
      filter.trackerId = trackerId;

      var events = queryObject.where({'parent' : filter.trackerId}).exec();

      var eventCounts = {};
      var tod =  {
        counts : {
          '12am' :  0, '1am' :  0, '2am' :  0, '3am' :  0, '4am' :  0, '5am' :  0, '6am' :  0, '7am' :  0, '8am' :  0, '9am' :  0, '10am' :  0, '11am' :  0,
          '12pm' :  0, '1pm' :  0, '2pm' :  0, '3pm' :  0, '4pm' :  0, '5pm' :  0, '6pm' :  0, '7pm' :  0, '8pm' :  0, '9pm' :  0, '10pm' :  0, '11pm' :  0
        }
      };
      var dow = {
        counts : { 'sun' : 0, 'mon' : 0, 'tue' : 0, 'wed' : 0, 'thu' : 0, 'fri' : 0, 'sat' : 0 }
      };

      // Loop over events
      for(var i in events) {
        var event = events[i];
        var mtime = moment(event.time);
        var timeSlot = moment(mtime).startOf('day').toDate().getTime();
        var dowSlot = mtime.format('ddd').toLowerCase(); // Day of Week Slot "sun"
        var todSlot = mtime.format('ha').toLowerCase(); // Time of Day Slot "1a"

        if(eventCounts.hasOwnProperty(timeSlot)) {
          eventCounts[timeSlot]++;
        } else {
          eventCounts[timeSlot]=1;
        }
        dow.counts[dowSlot]++;
        tod.counts[todSlot]++;
      } // end looping over events

      tod.percents = self.averageKeyValue(tod.counts);
      dow.percents = self.averageKeyValue(dow.counts);

      var eachDay = self.fillInCalendar(eventCounts);
      var eachDayAverage = (jStat.mean(self.toValueArray(eachDay))).toFixed(1);
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




      // Day of Week
      //


      // Time of Day
      //
      var last = null;
      var first = null;
      if(events.length) {
        last = events[events.length-1].time;
        first = events[0].time;
      }

      var trackerData = {
        last : last,
        first : first,
        eventCount : events.length,
        eachDay : eachDay,
        timeOfDay : tod,
        dayOfWeek : dow,
        eachDayAvg : eachDayAverage,
        eachDayMax : eachDayMax,
        eachDayMin : eachDayMin,
        outliers : outliers,
        events : events
      };
    //  console.log("Sending back tracker data", trackerData)

      return trackerData;
    };


    self.saveDatasource = function(config, callback) {
      var ds = angular.copy(config);

      if(ds.type=="csv"||ds.type=="dropbox") {
        var file = document.getElementById(ds.type+'-file');
        console.log("This is the file input", file.files);
        // Check for the various File API support.
        ds.config[ds.type].file = file.files[0];
        NomieLab.datasources.add(ds, function(err, data) {
          callback(err, data);
          if(err===null) {
            //$rootScope.cancelNewDatasource();
            NomieLab.notify.success(ds.type+" was saved");
          } else {
            alert("Error saving the Datasource: ", err.message);
          }
        });
      } else {
        /// Move this out of the else once we're done hacking
        NomieLab.datasources.add(ds, function(err, data) {
          callback(err, data);
          if(err===null) {
            $rootScope.cancelNewDatasource();
          } else {
            alert("Error saving the Datasource: ", err.message);
          }
        });
        /// Move this out of the else once we're done hacking
      }
    }


    self.datasourceStub = function() {
      return {
        type : 'dropbox',
        config : {
          couchdb : {
            type : 'couchdb',
            https : false,
            host : 'localhost:5984',
            username : 'atest1',
            password : 'gut666123456',
            validated : false
          },
          csv : {
            type : 'csv',
            file : null,
            validated : false
          },
          dropbox : {
            type : 'dropbox',
            file : null,
            validated : false
          }
        }
      }
    }

		return self;
	} // end main Base service function
]);

/**
 * Base Service
 * @memberof Base
 * @namespace BaseService
 */
angular
	.module('BaseModule')
	.service('LabBoot', [ '$rootScope', '$timeout',
	function ($rootScope, $timeout) {
    console.log("The Lab is Booting");
		var self = this;

		return self;
	} // end main Base service function
]).filter('toArray', function () {
  return function (obj, addKey) {
    if (!angular.isObject(obj)) return obj;
    if ( addKey === false ) {
      return Object.keys(obj).map(function(key) {
        return obj[key];
      });
    } else {
      return Object.keys(obj).map(function (key) {
        var value = obj[key];
        return angular.isObject(value) ?
          Object.defineProperty(value, '$key', { enumerable: false, value: key}) :
          { $key: key, $value: value };
      });
    }
  };
});;
