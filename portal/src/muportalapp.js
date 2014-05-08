/**
 * muportalapp.js
 * app main module
 */
'use strict';

var muPortalApp = angular.module('muPortal', ['ngRoute', 'localization', 'ui.bootstrap']).
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/', {templateUrl:'partials/welcome.html', controller:"mainController"}).
            when('/edit/:index', {templateUrl:'partials/form.html', controller:"mainController"}).
            when('/welcome', {templateUrl:'partials/welcome.html', controller:"mainController"}).
            otherwise({redirectTo:'/'});
    }]);
