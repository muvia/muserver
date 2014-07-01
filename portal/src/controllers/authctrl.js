
/**
 * controllers/authctrl.js
 * controller for the index
 */

muPortalApp.controller('authController', ["$scope", "$window", "authsrv", function($scope, $window, authsrv) {

    this.usr = null;
    this.psw = null;

    this.error = null;

    this.success = false;

    this.doLogin = function(){
        var self = this;
        authsrv.login(this.usr, this.psw, function(error){
            //console.log("error: ", error);
            self.error = error;
            if(self.error === null){
                //succefull login!
                self.success = true;
            }
        });
    }

}]);