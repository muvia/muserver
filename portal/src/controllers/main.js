/**
 * controllers/main.js
 * controller for the index
 */

muPortalApp.controller('mainController',
    function($scope, $locale) {

        var someText = {};
        someText.message = 'You have started your journey.';
        $scope.someText = someText;

        /**
         * given a partialname, like "welcome_intro.html", return the relative
         * localized path, like "partials/en/welcome_intro.html"
         * @param partialname
         */
        $scope.getLocalizedPartial= function(partialname){
            return "partials/"+$locale.id.substr(0, 2) + "/" + partialname;
        }

    });