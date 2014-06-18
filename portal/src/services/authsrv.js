/**
 * this service encapsulates the /login and /logout api endpoint.
 * it is in charge of setting and removing the authtoken and propagate
 */




muPortalApp.service("authsrv", [ "$rootScope", "$http", function($rootScope, $http){


    /**
     * this property will be used to monitor login/logout events in the whole app.
     * zero means logged out, >1 logged in. in the future, other values (maybe binary flags)
     * may enrich the meaning of it.
    */
    $rootScope.authcode = 0;

    /**
     *
     * @param usr
     * @param psw
     */
	this.login= function(usr, psw){
        $http({
            method: 'POST',
            url: '/api/login',
            data: {usr: usr, psw:psw}
        }).
            success(function(data, status, headers, config) {
                $rootScope.authcode = 1;
                $http.defaults.headers.common.Authorization = data.tkn;
                console.log("logged in!", $rootScope.authcode, data);
            }).
            error(function(data, status, headers, config) {
                    console.log("error loggin in", data, status);
            });
	};

    /**
     *
     */
	this.logout = function(){
        $http({
            method: 'POST',
            url: '/api/logout'
        }).
            success(function(data, status, headers, config) {
                $rootScope.authcode = 0;
                $http.defaults.headers.common.Authorization = null;
                console.log("logged out!", $rootScope.authcode);
            }).
            error(function(data, status, headers, config) {
                console.log("error logging out", data, status);
            });
	};
	
}]);
