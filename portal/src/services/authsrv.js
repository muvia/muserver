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


	this.ROLE_ANON = 0x1;
	this.ROLE_AUTH = 0x2;

    /**
     * this property will be used to monitor login/logout events in the whole app.
     * zero means logged out, >1 logged in. in the future, other values (maybe binary flags)
     * may enrich the meaning of it.
    */
    $rootScope.authcode = this.ROLE_ANON;

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
                $rootScope.authcode = self.ROLE_AUTH;
                $http.defaults.headers.common.Authorization = data.tkn;
                //console.log("logged in!", $rootScope.authcode, data);
            }).
            error(function(data, status, headers, config) {
                console.log("error loggin in", data, status);
            });
	};

    /**
     *
     */
	this.logout = function(){
		var self = this;
        $http({
            method: 'POST',
            url: '/api/logout'
        }).
            success(function(data, status, headers, config) {
                $rootScope.authcode = self.LEVEL_ANON;
                $http.defaults.headers.common.Authorization = null;
                //console.log("logged out!", $rootScope.authcode);
            }).
            error(function(data, status, headers, config) {
                //console.log("error logging out", data, status);
            });
	};

    /**
     * returns true or false if the accesslevel matches the $rootscope.authcode.
     * use the LEVEL_xxxx variables as accesslevel integer codes or as strings: 
     * anon, auth, all, none
     * @param accesslevel
     */
    this.authorize = function(accesslevel){
    	if(accesslevel === "none") accesslevel = 0;
    	else if(accesslevel === "anon") accesslevel = 1; 
    	else if(accesslevel === "auth") accesslevel = 2; 
    	else if(accesslevel == "all") accesslevel = 3;
    	else accesslevel =  parseInt(accesslevel);
        //console.log("authsrv.authorize acesslevel ", accesslevel, $rootScope.authcode, ($rootScope.authcode & accesslevel));
        return ($rootScope.authcode & accesslevel) > 0;
    };
	
}]);
