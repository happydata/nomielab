/**
 * Route Configuration
 */

NomieLabApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/starter', { // The URL path that should be used for this module
    templateUrl		: './app/modules/starter-module/starter-module.html',
    controller		: 'StarterModuleController',
  });
});

/**
 * Nomie StarterModule Controller
 */
NomieLabApp
	.controller('StarterModuleController', ['$scope', '$rootScope', '$timeout','StarterModuleService',
	function ($scope, $rootScope, $timeout, StarterModuleService) {

    $scope.vm = {};

    /**
     * Initialize the Module
     * @function init
     */

    $scope.vm.init = function() {
      // Init is used to prep your module. Below you will see how it's automaticall
      // called when the module is viewed, or the page is refreshed.
      //
      // JsonQuery is available for querying the responses from the datasource
      // Learn more about JsonQuery at  https://github.com/jiren/JsonQuery

      // Example on how to get all data
      // NomieLab.currentDatasource.getAllData(function(err, datapack) {
      //   $timeout(function() {
      //     $scope.vm.trackers = datapack.trackers;
      //     $scope.vm.notes = datapack.notes;
      //     $scope.vm.events = datapack.events;
      //     // Create a JSON Query ready object for events
      //     eventQuery = JsonQuery(datapack.events);
      //   });
      // });

      // Example on how to get just the Notes
      // NomieLab.currentDatasource.getNotes(function(err, notes) {
      //   $timeout(function() {
      //     $scope.vm.notes = notes;
      //     $scope.vm.notesQuery = JsonQuery(notes);
      //   });
      // });

      // Example on how to get just the Events
      // NomieLab.currentDatasource.getEvents(function(err, events) {
      //   $timeout(function() {
      //     $scope.vm.events = events;
      //     $scope.vm.eventsQuery = JsonQuery(events);
      //   });
      // });

    }; // scope.vm.init()


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
 * Nomie StarterModule Service
 * @memberof StarterModuleModule
 * @namespace StarterModuleService
 */
NomieLabApp
	.service('StarterModuleService', [ '$rootScope', '$timeout', 'BaseService',
	function ($rootScope, $timeout, BaseService) {
		var self = this;

    /**
     * Include your Modules logic in the it's service. Always try to keep
     * the controller as clean as possible.
     */

		return self;
	} // end main home service function
]);
