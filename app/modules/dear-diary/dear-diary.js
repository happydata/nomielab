/**
 * Route Configuration
 */

NomieLabApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/diary', { // The URL path that should be used for this module
    templateUrl		: './app/modules/dear-diary/dear-diary.html',
    controller		: 'DearDiaryController',
  });
});

/**
 * Nomie DearDiary Controller
 */
NomieLabApp
	.controller('DearDiaryController', ['$scope', '$rootScope', '$timeout','DearDiaryService',
	function ($scope, $rootScope, $timeout, DearDiaryService) {

    $scope.vm = {
      orderBy : '-time'
    };
    // $scope.map = L.map('note-map', {
    //     center: [51.505, -0.09],
    //     zoom: 13
    // });
    // var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
    // });
    // $scope.map.addLayer(layer);

    /**
     * Initialize the Module
     * @function init
     */
    $scope.trim = DearDiaryService.trim;

    $scope.vm.init = function() {

      DearDiaryService.getNotes({}, function(err, data) {
        if(!err) {
          $timeout(function() {
            $scope.vm.notes = data.notes;
            $scope.vm.query = data.query;
            $scope.vm.tags = data.tags;
          });
        } else {
          LAB.notify({
            title : 'Error',
            message : err.message
          });
        }
      }); // DearDiaryService.getNotes();
    }; // scope.vm.init()

    $scope.vm.showNote = function(note) {
      $timeout(function() {
        $scope.vm.note = note;
        if(note.geo.length>0) {
          $scope.vm.showMap(note);
        } else {
          $scope.vm.hideMap();
        }
      });
    }

    $scope.vm.showMap = function(note) {
      var lat = note.geo[0];
      var lon = note.geo[1];
      $scope.vm.mapVisible = true;
      $timeout(function() {
        document.getElementById('note-map').innerHTML = "<div id='diaryMap' style='width: 100%; height: 300px;'></div>";
        var osmUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            osmAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        osmLayer = new L.TileLayer(osmUrl, {maxZoom: 18, attribution: osmAttribution});
        var map = new L.Map('diaryMap');
        map.setView(new L.LatLng(lat,lon), 15 );
        map.addLayer(osmLayer);
        var marker = L.marker(note.geo).addTo(map);
      });
    };
    $scope.vm.hideMap = function(note) {
      $scope.vm.mapVisible = false;
    };

    /*****************************************************
    * Auto Fire off INIT when the datasource is selected
    * and 1000ms after the page is loaded (if we're on this module)
    ******************************************************/
    $rootScope.$on('datasource-selected', function(event, datasource) {
      $scope.vm.init();
    });
    $timeout(function() {
      $scope.vm.init();
    },1000);

	} // end main home controller function
]);

/**
 * Nomie DearDiary Service
 * @memberof DearDiaryModule
 * @namespace DearDiaryService
 */
NomieLabApp
	.service('DearDiaryService', [ '$rootScope', '$timeout', 'BaseService',
	function ($rootScope, $timeout, BaseService) {
		var self = this;

    /**
     * Include your Modules logic in the it's service. Always try to keep
     * the controller as clean as possible.
     */

    self.getNotes = function(options, callback) {
      options=options||{};
      NomieLab.currentDatasource.getNotes(options, function(err, notes) {
        if(!err) {
          callback(null, {
            notes: notes,
            query : JsonQuery(notes),
            tags : self.extractTags(notes)
          });
        } else {
          callback(err, null);
        }
      });
    }



    self.extractTags = function(notes) {
      var tagMap = {};
      var tagArray = [];
      for(var i in notes) {
        var tags = notes[i].value.match(/#\w+/g);
        for(var t in tags) {
          if(tagMap.hasOwnProperty(tags[t])) {
            tagMap[tags[t]].count++;
          } else {
            tagMap[tags[t]] = {
              count : 1,
              name : tags[t]
            };
          }
        }
      }

      for(var tm in tagMap) {
        tagArray.push(tagMap[tm]);
      }
      console.log(tagArray, tagMap);
      return tagArray;
    };

    self.trim = function(note, max) {
      var add = add || '...';
      return (note.length > max ? note.substring(0,max)+add : note);
    }

		return self;
	} // end main home service function
]);
