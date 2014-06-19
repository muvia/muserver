/**
 * this service encapsulates the /login and /logout api endpoint.
 * it is in charge of setting and removing the authtoken and propagate
 */




muPortalApp.service("authsrv", [ "$rootScope", "$http", function($rootScope, $http){


    /**
     * only allow anonymous users
     * @type {number}
     */
    this.LEVEL_ANON = 0x1;

    /**
     * allow anonymous and logged users
     * @type {number}
     */
    this.LEVEL_ALL = 0x3;


    /**
     * only allow authenticated users
     * @type {number}
     */
    this.LEVEL_AUTH = 0x2;



    /**
     * this property will be used to monitor login/logout events in the whole app.
     * zero means logged out, >1 logged in. in the future, other values (maybe binary flags)
     * may enrich the meaning of it.
    */
    $rootScope.authcode = this.LEVEL_ANON;

    /**
     *
     * @param usr
     * @param psw
     */
	this.login= function(usr, psw){
        var self = this;
        $http({
            method: 'POST',
            url: '/api/login',
            data: {usr: usr, psw:psw}
        }).
            success(function(data, status, headers, config) {
                $rootScope.authcode = self.LEVEL_ALL;
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

    /**
     * returns true or false if the accesslevel matches the $rootscope.authcode.
     * use the LEVEL_xxxx variables as accesslevel codes
     * @param accesslevel
     */
    this.authorize = function(accesslevel){
        console.log("authsrv.authorize acesslevel ", accesslevel);
        return $rootScope.authcode & parseInt(accesslevel);
    }
	
}]);
