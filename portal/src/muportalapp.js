
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
            when('/login', {templateUrl:'partials/login.html', controller:"authController"}).
            when('/logout', {templateUrl:'partials/logout.html', controller:"authController"}).
            when('/register', {templateUrl:'partials/register.html', controller:"authController"}).
            when('/welcome', {templateUrl:'partials/welcome.html', controller:"mainController"}).
            when('/profile', {templateUrl:'partials/profile.html', controller:"mainController"}).
            when('/virtualworld', {templateUrl:'partials/virtualworld.html', controller:"mainController"}).
            otherwise({redirectTo:'/'});
    
    }]);

muPortalApp.run(function($rootScope, $http) {
    /*user.init({
    	appId: '53739ca105ab1',
		heartbeatInterval: 0 
    });*/

});

