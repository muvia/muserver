
/**
 * controllers/mainctrl.js
 * controller for the index
 */

muPortalApp.controller('mainController', ["$rootScope", "$scope", "$window",
   function($rootScope, $scope, $window) {

        /**
         * status inform the current screen and if the user is logged in.
         * @type {string}
         */
        this.status = "_login_anon_";

        /*var someText = {};
        someText.message = 'You have started your journey.';
        $scope.someText = someText;
        */

        $scope.locale = ($window.navigator.userLanguage || $window.navigator.language);
        console.log("your locale is: " +$scope.locale);

        /**
         * given a partialname, like "welcome_intro.html", return the relative
         * localized path, like "partials/en/welcome_intro.html"
         * @param partialname
         */
        $scope.getLocalizedPartial= function(partialname){
            return "partials/"+$scope.locale.substr(0, 2) + "/" + partialname;
        }

       /**
       *  keep track of changes in route to update the status bar
        */
       var self = this;
       $rootScope.$on("$routeChangeStart",function(event, next, current){
           console.log("routeChangeStart",next.originalPath);
           //parse the route (in the form "/path") to the form "_path_". we expect to match some i18n symbol!
           if(next.originalPath === "/")
            self.status ="_welcome_";
           else{
               self.status = "_"+next.originalPath.substring(1)+"_";
           }
       });



    } ]);