
/**
 * muportalapp.js
 * app main module
 */

var muPortalApp = angular.module('muPortal', ['ngRoute', 'ui.bootstrap', 'localization']).
    config(['$routeProvider', function ($routeProvider) {
    	'use strict';

        
    	//configure navigation paths in client side
        $routeProvider.
            when('/', {templateUrl:'partials/welcome.html'}).
            when('/login', {templateUrl:'partials/login.html'}).
            when('/logout', {templateUrl:'partials/logout.html', controller:'logoutController'}).
            when('/register', {templateUrl:'partials/register.html'}).
            when('/welcome', {templateUrl:'partials/welcome.html'}).
            when('/profile', {templateUrl:'partials/profile.html'}).
            when('/contact', {templateUrl:'partials/contact.html'}).
            when('/virtualworld', {templateUrl:'partials/virtualworld.html', controller: 'virtualworldController'}).
            otherwise({redirectTo:'/'});
    
    }]);

muPortalApp.run(function($rootScope, $http) {
});

