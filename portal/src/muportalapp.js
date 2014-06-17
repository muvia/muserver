
/**
 * muportalapp.js
 * app main module
 */
'use strict';

var muPortalApp = angular.module('muPortal', ['ngRoute', 'localization', 'ui.bootstrap']).
    config(['$routeProvider', function ($routeProvider) {
        
    	//configure navigation paths in client side
        $routeProvider.
            when('/', {templateUrl:'partials/welcome.html', controller:"mainController"}).
            when('/login', {templateUrl:'partials/login.html', controller:"authController", public: true}).
            when('/register', {templateUrl:'partials/register.html', controller:"authController", public: true}).
            when('/welcome', {templateUrl:'partials/welcome.html', controller:"mainController", login: true}).
            when('/profile', {templateUrl:'partials/profile.html', controller:"mainController", login: true}).
            when('/virtualworld', {templateUrl:'partials/virtualworld.html', controller:"mainController", login: true}).
            otherwise({redirectTo:'/'});
    
    }]);

muPortalApp.run(function($rootScope, $http) {
    /*user.init({
    	appId: '53739ca105ab1',
		heartbeatInterval: 0 
    });*/
    
	//add and remove auth token from session headers so they are available on server side 
	$rootScope.$on('user.login', function() {
		console.log('adding auth token to headers ' + user.token());
		$http.defaults.headers.common.Authorization = 'Basic ' + btoa(':' + user.token());
	});
	
	$rootScope.$on('user.logout', function() {
		console.log('removing auth token from headers ');
		$http.defaults.headers.common.Authorization = null;
	});

});

