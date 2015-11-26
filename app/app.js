/**
 * App Settings
 * @namespace App
 */
var NomieLab = new NomieLabCore();
var NomieLabApp = angular.module('NomieLab',[
	'ngRoute',
	'angularMoment',
	'BaseModule'
]).config(function($routeProvider, $locationProvider) {
	$routeProvider
   .when('/home', {
    templateUrl		: './app/base/home.html',
    controller		: 'BaseController',
  }).when('/something/else', {
		templateUrl		: './app/base/base.html',
		controller		: 'HomeController',
	}).otherwise('/home');
  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(false);

});
