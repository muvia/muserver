
/**
 * controllers/logoutctrl.js
 * controller for the logout operation. it execute the logout code at construction time.
 */

muPortalApp.controller('profileController', ["$scope", "profilesrv", function($scope, profilesrv) {
  'use strict';

  $scope.profile = {
    sounds: null,
    engine: null,
    controller: null
  };

  profilesrv.getProfile(function(profile){
    $scope.profile = profile;
  });

}]);