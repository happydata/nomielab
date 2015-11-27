var hack;
/**
 * Nomie MapMe Module
 * @namespace MapMeModule
 */
NomieLabApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/mapme', {
    templateUrl		: './app/modules/lab-map-me/lab-map-me.html',
    controller		: 'MapMeController',
  });
});

/**
 * Nomie MapMe Controller
 * @memberof MapMeModule
 * @namespace MapMeController
 */
NomieLabApp
	.controller('MapMeController', ['$scope', '$rootScope', '$timeout', 'MapMeService','$interval',
	function ($scope, $rootScope, $timeout, MapMeService,$interval) {
		$scope.vm = {};

    $scope.vm.mapme = {
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
    $scope.map = L.map('mapme-map', {
        center: [51.505, -0.09],
        zoom: 13
    });
    var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    });
    $scope.map.addLayer(layer);
    var marker = L.marker([51.5, -0.09]);
    marker.addTo($scope.map);

    /** SEtup Player **/
    var player = {
      state  : 'paused',
      position : 0,
      startDate : null,
      endDate : null
    }

    var eventQuery;

    $scope.vm.position = 0;
    $scope.vm.max = 0;

    $scope.vm.init = function() {

      NomieLab.currentDatasource.getAllData(function(err, datapack) {
        $timeout(function() {
          $scope.vm.mapme.trackers.count = datapack.trackers.length;

          $scope.vm.mapme.trackers.data = datapack.trackers;
          console.log("Trackers Data", $scope.vm.mapme.trackers);
          $scope.vm.mapme.notes.count = datapack.notes.length;
          $scope.vm.mapme.notes.data = datapack.notes;
          $scope.vm.mapme.events.count = datapack.events.length;
          $scope.vm.mapme.events.data = datapack.events;
          $scope.vm.max = datapack.events.length;
          eventQuery = JsonQuery(datapack.events);

          $scope.vm.nextEvent();

        });
      })

    }; // scope.vm.init()

    $scope.vm.changeTime = function(input) {
      console.log("CHange Time", input, $scope.vm.rangePosition);
      console.log("Index", $scope.getIndexFromPercent($scope.vm.rangePosition, $scope.vm.mapme.events.data.length));
      $scope.vm.exactEvent($scope.getIndexFromPercent($scope.vm.rangePosition, $scope.vm.mapme.events.data.length));
    }

    $scope.getPositionPercent = function(index, max) {
      return Math.ceil((index / max) * 100);
    };
    $scope.getIndexFromPercent = function(percent, max) {
      return Math.ceil((percent * max) / 100);
    };

    var playInterval;
    $scope.vm.play = function() {
      $scope.vm.playing = true;
      playInterval = $interval(function() {
        $scope.vm.nextEvent();
      },100);
    }
    $scope.vm.pause = function() {
      $scope.vm.playing = false;
      $interval.cancel(playInterval);
    }


    $scope.vm.showEvent = function(event) {
      $scope.vm.event = event;
      $scope.map.panTo(new L.LatLng(event.geo[0],event.geo[1]));
      var eventIcon;
      $timeout(function() {
        $scope.vm.runningScore = $scope.vm.runningScore + event.charge;
        if(event.charge>0) {
          $scope.vm.positiveScore = $scope.vm.positiveScore + event.charge;
          eventIcon = MapMeService.positiveIcon
        } else if(event.charge<0) {
          $scope.vm.negativeScore = $scope.vm.negativeScore + event.charge;
          eventIcon = MapMeService.negativeIcon;
        } else {
          $scope.vm.neutralScore = $scope.vm.neutralScore + event.charge;
          eventIcon = MapMeService.neutralIcon;
        }
        var m = L.marker(event.geo, { icon: eventIcon }).addTo($scope.map);
        $timeout(function() {
          $scope.map.removeLayer(m);
        },1000);
      });
      marker.setLatLng(event.geo).addTo($scope.map);
    }

    $scope.vm.showAll = function() {
      console.log("Showing All")
      for(var i = 0; i<$scope.vm.mapme.events.data.length; i++) {
        console.log("Element");
        var event = $scope.vm.mapme.events.data[i];
        if(event.geo.length>0) {
          L.marker(event.geo).bindPopup("Tracker Name").addTo($scope.map);
        }
      }
    }

    $scope.vm.nextEvent = function() {
      for(var i = $scope.vm.position; i<$scope.vm.mapme.events.data.length; i++) {
        var event = $scope.vm.mapme.events.data[i];
        if(event.geo.length>0) {
          if(!isNaN(event.geo[0])&&!isNaN(event.geo[1])) {
            $scope.vm.position = i+1;
            $scope.vm.rangePosition = $scope.getPositionPercent(i, $scope.vm.mapme.events.data.length);
            $scope.vm.showEvent(event);
            break;
          }
        }
      }
    }
    $scope.vm.previousEvent = function() {
      $scope.vm.position--;
      $scope.vm.rangePosition = $scope.getPositionPercent($scope.vm.position, $scope.vm.mapme.events.data.length);
      $scope.vm.showEvent($scope.vm.mapme.events.data[$scope.vm.position]);
    }

    $scope.vm.exactEvent = function(index) {
      $timeout(function() {
        $scope.vm.position = index;
        $scope.vm.rangePosition = $scope.getPositionPercent(index, $scope.vm.mapme.events.data.length);
        $scope.vm.showEvent($scope.vm.mapme.events.data[index]);
      });
    }

    hack = $scope;

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
 * Nomie MapMe Service
 * @memberof MapMeModule
 * @namespace MapMeService
 */
NomieLabApp
	.service('MapMeService', [ '$rootScope', '$timeout', 'BaseService',
	function ($rootScope, $timeout, BaseService) {
		var self = this;

    self.positiveIcon = L.icon({
      iconUrl : '/images/positive-marker.png',
      iconSize : [18,18]
    });
    self.negativeIcon = L.icon({
      iconUrl : '/images/negative-marker.png',
      iconSize : [18,18]
    });
    self.neutralIcon = L.icon({
      iconUrl : '/images/neutral-marker.png',
      iconSize : [18,18]
    });

		return self;
	} // end main home service function
]);
