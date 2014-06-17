
/**
 * controllers/authctrl.js
 * controller for the index
 */

muPortalApp.controller('authController', ["$scope", "$window", "authsrv", function($scope, $window, authsrv) {

    this.usr = null;
    this.psw = null;

    this.doLogin = function(){
        console.log("the login2!", this.usr, this.psw);
        authsrv.login(this.usr, this.psw);
    }

}]);