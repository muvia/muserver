
/**
 * controllers/authctrl.js
 * controller for the index
 */

muPortalApp.controller('authController', ["$scope", "$window", "authsrv", "profilesrv", function($scope, $window, authsrv, profilesrv) {
  'use strict';
    this.usr = null;
    this.psw = null;

    this.error = null;

    this.success = false;

    this.doLogin = function(){
        var self = this;
        authsrv.login(this.usr, this.psw, function(error){
            self.error = error;
            if(!self.error){
                //succefull login!
                self.success = true;
                //good point to pre-load the profile?? yeahp, at least for testing..
                profilesrv.getProfile(function(profile){
                   console.log("authController.login:loading profile: got: ", profile);
                });
            }
        });
    };

}]);