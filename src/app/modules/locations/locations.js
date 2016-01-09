var hack;
/**
 * Nomie Locations Module
 * @namespace LocationsModule
 */
NomieLabApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/locations', {
    templateUrl		: './app/modules/locations/locations.html',
    controller		: 'LocationsController',
  });
});

/**
 * Nomie Locations Controller
 * @memberof LocationsModule
 * @namespace LocationsController
 */
NomieLabApp
	.controller('LocationsController', ['$scope', '$rootScope', '$timeout', 'LocationsService','$interval', 'BaseService',
	function ($scope, $rootScope, $timeout, LocationsService,$interval, BaseService) {
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

    $scope.locationCache = {};
    $scope.vm.getLocation = function(lat,lng,callback) {
      var locationSlot = lat+'|'+lng;
      if($scope.locationCache.hasOwnProperty(locationSlot)) {
        callback(null, $scope.locationCache[locationSlot]);
      } else {
        BaseService.locations.getLocation(lat,lng, function(err, locationData) {
          $scope.locationCache[locationSlot] = locationData;
          callback(null, locationData);
        });
      }
    };

    $scope.vm.panTo = function(lat,lng) {
      $scope.map.panTo(new L.LatLng(lat,lng));
    }
    $scope.vm.showEvent = function(event) {
      $scope.vm.event = event;
      $scope.map.panTo(new L.LatLng(event.geo[0],event.geo[1]));
      var eventIcon;
      $timeout(function() {
        $scope.vm.runningScore = $scope.vm.runningScore + event.charge;
        if(event.charge>0) {
          $scope.vm.positiveScore = $scope.vm.positiveScore + event.charge;
          eventIcon = LocationsService.positiveIcon
        } else if(event.charge<0) {
          $scope.vm.negativeScore = $scope.vm.negativeScore + event.charge;
          eventIcon = LocationsService.negativeIcon;
        } else {
          $scope.vm.neutralScore = $scope.vm.neutralScore + event.charge;
          eventIcon = LocationsService.neutralIcon;
        }
        var m = L.marker(event.geo, { icon: eventIcon }).addTo($scope.map);
        $timeout(function() {
          $scope.map.removeLayer(m);
        },1000);
      });
      //marker.setLatLng(event.geo).addTo($scope.map);
    }



    $scope.vm.showingAll = false;
    $scope.vm.locations = [];
    var showAllClusterLayer;



    $scope.vm.showAll = function() {

      if($scope.vm.showingAll == false) {
        $scope.vm.showingAll = true;
        console.log("Showing All");
        var cluster = {};

        $scope.locationCluster = {};

        showAllClusterLayer = [];

        for(var i = 0; i<$scope.vm.mapme.events.data.length; i++) {
          var event = $scope.vm.mapme.events.data[i];
          if(event.geo.length>0) {
            var lat = parseFloat(event.geo[0].toFixed(3));
            var lng = parseFloat(event.geo[1].toFixed(3));
            if(cluster.hasOwnProperty(lat+'|'+lng)) {
              cluster[lat+'|'+lng].count++;
              cluster[lat+'|'+lng].charge = cluster[lat+'|'+lng].charge+event.charge;
            } else {
              cluster[lat+'|'+lng]= { count : 1, charge : event.charge };
            }
            /**
            * Location Clustering
            * "Rounding" a lat long to a common set of locations.
            */

            var locationLat = parseFloat(event.geo[0].toFixed(1));
            var locationLng = parseFloat(event.geo[1].toFixed(1));
            var locationSlot = locationLat + '|' + locationLng;
            if($scope.locationCluster.hasOwnProperty(locationSlot)) {
              $scope.locationCluster[locationSlot].count++;
              $scope.locationCluster[locationSlot].charge = $scope.locationCluster[locationSlot].charge+event.charge;
            } else {
              $scope.locationCluster[locationSlot]= { count : 1, charge : event.charge, lat : lat, lng : lng };
            }

          } // end if has geo
        } // end looping over events;

        console.log("Location Cluster", $scope.locationCluster);
        // Get Location Names;
        function getLocation(geo, callback) {
          console.log("getting location for", geo);
          var latlng = geo.split('|');
          var thisGeo = geo;
          $scope.vm.getLocation(latlng[0], latlng[1], function(err, locationData) {
            $timeout(function() {
              $scope.locationCluster[thisGeo].lookup = locationData;
              console.log("Got location for ", $scope.locationCluster[thisGeo]);
            },120);
          });
        }
        var c = 0;
        for(var geo in $scope.locationCluster) {
        //  if(c<10) {
            getLocation(geo);
          // }
          // c++;
        }




        for(var l in cluster) {
          var eventCluster = cluster[l];
          if(eventCluster.charge>0) {
            eventIcon = LocationsService.positiveIcon
          } else if(eventCluster.charge<0) {
            eventIcon = LocationsService.negativeIcon;
          } else {
            eventIcon = LocationsService.neutralIcon;
          }
          var m = L.marker(l.split('|'), { icon: eventIcon });
          showAllClusterLayer.push(m);
          m.addTo($scope.map);
        } // end looping over cluster

      } else {
        $scope.vm.showingAll = false;
        for(var m in showAllClusterLayer) {
          $scope.map.removeLayer(showAllClusterLayer[m]);
        }
      }



    } // end loop over events;


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
 * Nomie Locations Service
 * @memberof LocationsModule
 * @namespace LocationsService
 */
NomieLabApp
	.service('LocationsService', [ '$rootScope', '$timeout', 'BaseService',
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
