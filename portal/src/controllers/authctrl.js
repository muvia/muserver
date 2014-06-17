
/**
 * controllers/authctrl.js
 * controller for the index
 */

muPortalApp.controller('authController', ["$scope", "$window", function($scope, $window) {

    this.usr = null;
    this.psw = null;

    this.doLogin = function(){
        console.log("the login2!", this.usr, this.psw);
    }

}]);