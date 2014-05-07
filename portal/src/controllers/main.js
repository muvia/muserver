/**
 * controllers/main.js
 * controller for the index
 */

muPortalApp.controller('mainController',
    function($scope, $locale) {

        var someText = {};
        someText.message = 'You have started your journey.';
        $scope.someText = someText;

        //$locale.id has the form en-us.. we are only interested in language "en" or "es"..
        $scope.partialspath = $locale.id.substr(0, 2) + "/";
    });