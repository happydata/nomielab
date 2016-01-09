/**
 * App Settings
 * @namespace App
 */
var NomieLab = new NomieLabCore();
var NomieLabApp = angular.module('NomieLab',[
	'ngRoute',
	'angularMoment',
	'BaseModule',
  'chartComponents',
  'eventmapModule',
  'ui.bootstrap'
]).config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/home', {
    templateUrl		: './app/base/home.html',
    controller		: 'BaseController',
  }).otherwise('/home');
  $locationProvider.html5Mode(false);
});
