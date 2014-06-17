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
                console.log("success", data, status, headers, config);
            }).
            error(function(data, status, headers, config) {
                console.log("error",data,status,headers,config);
            });
	};

    /**
     *
     */
	this.logout = function(){
		
	};
	
}]);
