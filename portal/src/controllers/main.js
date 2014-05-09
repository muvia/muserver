/**
 * controllers/main.js
 * controller for the index
 */

muPortalApp.controller('mainController',
    function($scope, $window) {

        var someText = {};
        someText.message = 'You have started your journey.';
        $scope.someText = someText;

        $scope.locale = ($window.navigator.userLanguage || $window.navigator.language)

        /**
         * given a partialname, like "welcome_intro.html", return the relative
         * localized path, like "partials/en/welcome_intro.html"
         * @param partialname
         */
        $scope.getLocalizedPartial= function(partialname){
            console.log("your locale is: " +$scope.locale);
            return "partials/"+$scope.locale.substr(0, 2) + "/" + partialname;
        }

    });