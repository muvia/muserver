/**
 * muportalapp.js
 * app main module
 */
'use strict';

var muPortalApp = angular.module('muPortal', ['localization']);

/*.
    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.
            when('/', {templateUrl:'partials/home.html', controller:HomeController}).
            when('/edit/:index', {templateUrl:'partials/form.html', controller:EditPersonController}).
            when('/new', {templateUrl:'partials/form.html', controller:NewPersonController}).
            otherwise({redirectTo:'/'});
    }]);
*/