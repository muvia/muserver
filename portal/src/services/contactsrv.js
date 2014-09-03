/**
 * src/services/contactsrv.js
 * this service encapsulate the /contact api endpoint
 */




muPortalApp.service("contactsrv", ["$http", function($http){
  'use strict';
    /**
     * send a contact message filled in the contact form
     */
	this.sendMessage = function(name, email, message, cb){
        var self = this;
        $http({
            method: 'POST',
            url: '/api/contact',
            data: {name: name, email:email, message: message}
        }).
            success(function(data, status, headers, config) {
                //$rootScope.authcode = self.ROLE_AUTH;
                //$http.defaults.headers.common.Authorization = data.tkn;
                cb(null);
            }).
            error(function(data, status, headers, config) {
                console.log("error sending contact message", data, status);
                cb("API_ERROR");
            });
	};
	
}]);
