/**
 * muportalapp.js
 * app main module
 */
'use strict';

var muPortalApp = angular.module('muPortal', ['ngRoute', 'localization', 'ui.bootstrap', 'UserApp']).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/', {templateUrl:'partials/welcome.html', controller:"mainController"}).
            when('/login', {templateUrl:'partials/login.html', controller:"authController", login: true}).
            when('/register', {templateUrl:'partials/register.html', controller:"authController", public: true}).
            when('/welcome', {templateUrl:'partials/welcome.html', controller:"mainController", public: true}).
            otherwise({redirectTo:'/'});
    }]);


muPortalApp.run(function($rootScope, user) {
    user.init({ appId: '53739ca105ab1' });

});
