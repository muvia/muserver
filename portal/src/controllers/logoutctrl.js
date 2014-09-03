
/**
 * controllers/logoutctrl.js
 * controller for the logout operation. it execute the logout code at construction time.
 */

muPortalApp.controller('logoutController', ["$scope", "$window", "authsrv", function($scope, $window, authsrv) {
  'use strict';
    authsrv.logout();

}]);