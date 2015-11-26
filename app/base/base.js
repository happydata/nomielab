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

		$scope.vm = {};
    $scope.vm.newDatasource = BaseService.datasourceStub();

    $rootScope.addDatasource = function() {
      $('#add-datasource-modal').slideDown();
    }
    $rootScope.cancelNewDatasource = function() {
      $('#add-datasource-modal').slideUp();
    }

    $rootScope.getClass = function (path) {
      if ($location.path().substr(0, path.length) === path) {
        return 'active';
      } else {
        return '';
      }
    }

    $scope.vm.saveDatasource = function() {
      console.log("######## VM.SAVEDATASOURCE() ########");
      $timeout(function() {
        BaseService.saveDatasource($scope.vm.newDatasource, function(err, data) {
          if(err===null) {
            NomieLab.notify.success("Datasource Successfully Saved");
          } else {
            alert("Adding Datasource Failed. Reason: "+err.message);
          }
        });
      });
    }

	} // end main Base controller function
]);
/**
 * Base Service
 * @memberof Base
 * @namespace BaseService
 */
angular
	.module('BaseModule')
	.service('BaseService', [ '$rootScope', '$timeout',
	function ($rootScope, $timeout) {
    console.log("The Lab is Booting");
		var self = this;

    $timeout(function() {
      $rootScope.datasources = NomieLab.datasources.getAll();
      console.log("Datasource", $rootScope.datasources);
      if(NomieLab.storage.get('currentDatasource')) {
        NomieLab.currentDatasource = new NomieLabDatasource(NomieLab.storage.get('currentDatasource'));
        $rootScope.currentDatasource = NomieLab.currentDatasource;
        console.log("Current Datasource Auto Selected", $rootScope.currentDatasource);
      } else {
        NomieLab.currentDatasource = null;
      }

    },100);

    $rootScope.selectDatasource = function(datasource) {
      console.log("### $rootScope.selectDatasource", datasource);
      NomieLab.currentDatasource = new NomieLabDatasource(datasource);
      $rootScope.currentDatasource = NomieLab.currentDatasource;
      $rootScope.$broadcast('datasource-selected', datasource);
      NomieLab.storage.set('currentDatasource', datasource);
      $timeout(function() {
        document.location.reload();
      },120)
    }

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
        type : 'couchdb',
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
]);
