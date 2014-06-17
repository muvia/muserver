/**
 * this service encapsulates the /login and /logount api endpoint
 */




muPortalApp.service("authsrv", [ "$http", function($http){

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
                console.log(data);
                $http.defaults.headers.common.Authorization = 'Basic :'+data.tkn;
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
                console.log("logged out!");
                $http.defaults.headers.common.Authorization = null;
            }).
            error(function(data, status, headers, config) {
                console.log("error logging out", data, status);
            });
	};
	
}]);
