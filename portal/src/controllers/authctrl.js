
/**
 * controllers/authctrl.js
 * controller for the index
 */

muPortalApp.controller('authController', ["$scope", "$window", "authsrv", function($scope, $window, authsrv) {

    this.usr = null;
    this.psw = null;


    this.doLogin = function(){
        authsrv.login(this.usr, this.psw);
    }

}]);