/**
 * muportalapp.js
 * app main module
 */

var muPortalApp = angular.module('muPortal', []);

/**
 * controllers/main.js
 * controller for the index
 */

muPortalApp.controller('mainController',
    function($scope) {
        var someText = {};
        someText.message = 'You have started your journey.';
        $scope.someText = someText;
    });