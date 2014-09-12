/*
 * An AngularJS Localization Service
 *
 * Written by Jim Lavin
 * http://codingsmackdown.tv
 *
 */
'use strict';
angular.module('localization', [])
    // localization service responsible for retrieving resource files from the server and
    // managing the translation dictionary
    .provider('localize', function localizeProvider() {

        this.languages = ['es-CO','en-US'];
        this.defaultLanguage = 'es-CO';
        this.ext = 'js';

        var provider = this;

        this.$get = ['$http', '$rootScope', '$window', '$filter', function ($http, $rootScope, $window, $filter) {

            var localize = {
                // use the $window service to get the language of the user's browser
                //language:$window.navigator.userLanguage || $window.navigator.language,
                //language:'',
                dictionary:[],
                // location of the resource file
                url: undefined,
                // flag to indicate if the service hs loaded the resource file
                resourceFileLoaded:false,

                // success handler for all server communication
                successCallback:function (data) {
                    // store the returned array in the dictionary
                    localize.dictionary = data;
                    // set the flag that the resource are loaded
                    localize.resourceFileLoaded = true;
                    // broadcast that the file has been loaded
                    $rootScope.$broadcast('localizeResourcesUpdated');
                },

                // allows setting of language on the fly
                setLanguage: function(value) {
                    localize.language = this.fallbackLanguage(value);
                    localize.initLocalizedResources();
                },

                fallbackLanguage: function(value) {

                    value = String(value);

                    if (provider.languages.indexOf(value) > -1) {
                        return value;
                    }

                    value = value.split('-')[0];

                    if (provider.languages.indexOf(value) > -1) {
                        return value;
                    }

                    return provider.defaultLanguage;
                },

                // allows setting of resource url on the fly
                setUrl: function(value) {
                    localize.url = value;
                    localize.initLocalizedResources();
                },

                // builds the url for locating the resource file
                buildUrl: function() {
                    if(!localize.language){
                        var lang, androidLang;
                        // works for earlier version of Android (2.3.x)
                        if ($window.navigator && $window.navigator.userAgent && (androidLang = $window.navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
                            lang = androidLang[1];
                        } else {
                            // works for iOS, Android 4.x and other devices
                            lang = $window.navigator.userLanguage || $window.navigator.language;
                        }
                        // set language
                        localize.language = this.fallbackLanguage(lang);
                    }
                    return '/i18n/resources-locale_' + localize.language + '.' + provider.ext;
                },

                // loads the language resource file from the server
                initLocalizedResources:function () {
                    // build the url to retrieve the localized resource file
                    var url = localize.url || localize.buildUrl();
                    // request the resource file
                    $http({ method:"GET", url:url, cache:false }).success(localize.successCallback).error(function () {
                        // the request failed set the url to the default resource file
                        var url = 'i18n/resources-locale_default' + '.' + provider.ext;
                        // request the default resource file
                        $http({ method:"GET", url:url, cache:false }).success(localize.successCallback);
                    });
                },

                // checks the dictionary for a localized resource string
                getLocalizedString: function(value) {
                    // default the result to an empty string
                    var result = '';

                    // make sure the dictionary has valid data
                    if ((localize.dictionary !== []) && (localize.dictionary.length > 0)) {
                        // use the filter service to only return those entries which match the value
                        // and only take the first result
                        var entry = $filter('filter')(localize.dictionary, function(element) {
                                return element.key === value;
                            }
                        );

                        // set the result
                        result = entry[0] ? entry[0].value : value;
                    }
                    // return the value to the call
                    return result;
                }
            };

            // force the load of the resource file
            localize.initLocalizedResources();

            // return the local instance when called
            return localize;
        } ];
    })
    // simple translation filter
    // usage {{ TOKEN | i18n }}
    .filter('i18n', ['localize', function (localize) {
        return function (input) {
            return localize.getLocalizedString(input);
        };
    }])
    // translation directive that can handle dynamic strings
    // updates the text value of the attached element
    // usage <span data-i18n="TOKEN" ></span>
    // or
    // <span data-i18n="TOKEN|VALUE1|VALUE2" ></span>
    .directive('i18n', ['localize', function(localize){
        var i18nDirective = {
            restrict:"EAC",
            updateText:function(elm, token){
                var values = token.split('|');
                if (values.length >= 1) {
                    // construct the tag to insert into the element
                    var tag = localize.getLocalizedString(values[0]);
                    // update the element only if data was returned
                    if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
                        if (values.length > 1) {
                            for (var index = 1; index < values.length; index++) {
                                var target = '{' + (index - 1) + '}';
                                tag = tag.replace(target, values[index]);
                            }
                        }
                        // insert the text into the element
                        elm.text(tag);
                    }
                }
            },

            link:function (scope, elm, attrs) {
                scope.$on('localizeResourcesUpdated', function() {
                    i18nDirective.updateText(elm, attrs.i18n);
                });

                attrs.$observe('i18n', function (value) {
                    i18nDirective.updateText(elm, attrs.i18n);
                });
            }
        };

        return i18nDirective;
    }])
    // translation directive that can handle dynamic strings
    // updates the attribute value of the attached element
    // usage <span data-i18n-attr="TOKEN|ATTRIBUTE" ></span>
    // or
    // <span data-i18n-attr="TOKEN|ATTRIBUTE|VALUE1|VALUE2" ></span>
    .directive('i18nAttr', ['localize', function (localize) {
        var i18NAttrDirective = {
            restrict: "EAC",
            updateText:function(elm, token){
                var values = token.split('|');
                // construct the tag to insert into the element
                var tag = localize.getLocalizedString(values[0]);
                // update the element only if data was returned
                if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
                    if (values.length > 2) {
                        for (var index = 2; index < values.length; index++) {
                            var target = '{' + (index - 2) + '}';
                            tag = tag.replace(target, values[index]);
                        }
                    }
                    // insert the text into the element
                    elm.attr(values[1], tag);
                }
            },
            link: function (scope, elm, attrs) {
                scope.$on('localizeResourcesUpdated', function() {
                    i18NAttrDirective.updateText(elm, attrs.i18nAttr);
                });

                attrs.$observe('i18nAttr', function (value) {
                    i18NAttrDirective.updateText(elm, value);
                });
            }
        };

        return i18NAttrDirective;
    }]);

//------
'use strict';

//where is the best place to put this piece of code?
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
})();

/**
 * World01Manager class
 */
var World01Manager = (function(engine){


  //----- PRIVATE CONSTANTS --------------

  //distance between the camera and the avatar
  var CAMERA_DISTANCE = 10;

  //number of cells by side of the grid
  var GRID_SIZE = 9;

  var CELL_SIZE = 1.5;

  //----- PRIVATE MODULE VARS ------------
  var grid = null;

  //root node
  var root = null;

  //array of sprites
  var fruits = null;

  var camera = null;

  var avatarNode = null;

  //move this to engine?
  var running = false;

  var sounds = {
    background: null
  };


  /**
   *
   * @constructor
   */
  var manager = function(canvas, accesibilityProfile){
    this.canvas = canvas;
    this.profile = accesibilityProfile;
  };

  /**
   * load all the stuff
   */
  manager.prototype.build = function(){
    MuEngine.setActiveCanvas(this.canvas);

    var p0  = vec3.fromValues(0, 0,  0);
    var px = vec3.fromValues(1, 0, 0);
    var py = vec3.fromValues(0, 1, 0);
    var pz = vec3.fromValues(0, 0, 1);

    //create the axis
    var axis = new MuEngine.Node();

    var linex = new MuEngine.Line(p0, px, "#ff0000");
    var nodex = new MuEngine.Node(linex);
    axis.addChild(nodex);

    var liney = new MuEngine.Line(p0, py, "#00ff00");
    axis.addChild( new MuEngine.Node(liney));

    var linez= new MuEngine.Line(p0, pz, "#0000ff");
    axis.addChild( new MuEngine.Node(linez));

    //create the grid
    grid = new MuEngine.Grid(GRID_SIZE, GRID_SIZE, CELL_SIZE, "#888888");
    var gridNode = new MuEngine.Node(grid);
    //center the grid
    gridNode.transform.setPos(GRID_SIZE*CELL_SIZE*-0.5, 0.0, GRID_SIZE*CELL_SIZE*-0.5);

    putSprite(0, 0, "assets/arbol.png");
    putSprite(0, 1, "assets/casa.png");
    putSprite(0, 2, "assets/flor.png");

    //create root node
    root = new MuEngine.Node();
    root.addChild(axis);
    root.addChild(gridNode);

    fruits = [];

    fruits.push(putFruit(1, 0, 0));
    fruits.push(putFruit(2, 0, 1));
    fruits.push(putFruit(3, 0, 2));
    fruits.push(putFruit(4, 0, 3));
    fruits.push(putFruit(5, 0, 4));

    //create the camera
    camera = new MuEngine.Camera(this.canvas);
    camera.setOrtho(0, 10, -10, 10, -5, 5);

    MuEngine.setActiveCamera(camera);

    //the camera is located at 5 units over the floor, ten units toward the monitor.
    //this setup will produce a view with x to the right, y up and z toward the monitor.
    camera.setCenter(vec3.fromValues(0, 10, 10));
    camera.lookAt(vec3.fromValues(0, 0, -5));

    //create an avatar. it will be an avatar node plus an animated sprite primitive.
    avatarNode = new MuEngine.Avatar({
      row: 5,
      col: 5,
      grid: grid,
      speed:1.0
    });
    var avatarSprite = new MuEngine.Sprite("assets/muvia.png");
    //invoking "addAnimation" on a normal sprite transform it into an animated sprite
    avatarSprite.width = 2.0;
    avatarSprite.height = 2.48;
    avatarSprite.tilew = 128;
    avatarSprite.tileh = 128;
    avatarSprite.addAnimation("walk-front", 0, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    avatarSprite.addAnimation("walk-right", 1, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    avatarSprite.addAnimation("walk-left", 2, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    avatarSprite.addAnimation("walk-back", 3, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    avatarSprite.addAnimation("wave-front", 12, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1000);
    avatarSprite.anchor = MuEngine.Sprite.prototype.ANCHOR_BOTTOM;

    avatarNode.primitive = avatarSprite;
    avatarNode.mapWalkAnimation("walk-front","south");
    avatarNode.mapWalkAnimation("walk-back","north");
    avatarNode.mapWalkAnimation("walk-right","west");
    avatarNode.mapWalkAnimation("walk-left","east");

    avatarNode.addIdleAnimation("wave-front");

    avatarNode.primitive.play("wave-front", true);
    //attachment of the avatarNode to the grid occurs within avatarNode constructor

    //initialize sounds
    this.initSounds();

    //temporal, just for debug!
    window.avatarNode = avatarNode;
    window.gridNode = gridNode;

  };

  /**
  *
  */
  manager.prototype.initSounds = function(){

    if(this.profile.sounds.background){
      sounds.background = new Howl({
        urls: ['assets/sounds/170515__devlab__forest-ambient-01-loop.wav'],
        autoplay: true,
        loop: true,
        volume: 0.5
      });
    }

  };

  manager.prototype.playSound = function(name){
    if(sounds[name]){
      sounds[name].play();
    }
  };

  manager.prototype.stopSound = function(name){
    if(sounds[name]){
      sounds[name].stop();
    }
  };

  /**
   * render method to update the engine
   */
  manager.prototype.render = function(){
    var dt = MuEngine.tick();
    MuEngine.clear();

    //update of camera position. it is a feature that must be offered by the engine.
    MuEngine.p0[0] = avatarNode.wp[0];
    MuEngine.p0[1] = camera.center[1];
    MuEngine.p0[2] = Math.min(avatarNode.wp[2]+CAMERA_DISTANCE, CAMERA_DISTANCE);
    camera.setCenter(MuEngine.p0);
    camera.update();

    MuEngine.updateNode(root, dt);
    MuEngine.renderNode(root);
  };

  /**
   * unload all the stuff
   */
  manager.prototype.stop = function(){
    if(running){
      running = false;

      this.stopSound("background");

    }
  };

  /**
   *
   */
  manager.prototype.start = function(){
    running = true;
    var self = this;
    function animloop(){
        if(running) {
          requestAnimFrame(animloop);
          self.render();
        }else{
          self.destroy();
        }
    }
    animloop();
  };

  /**
   *
   */
  manager.prototype.destroy = function(){

  };



  manager.prototype.onMenuEntryTriggered = function(entryid){
    console.log("triggered ", entryid);

    if(entryid === "caminar_norte"){
      avatarNode.move("north");
    }
    else if(entryid === "caminar_sur"){
      avatarNode.move("south");
    }
    else if(entryid === "caminar_oriente"){
      avatarNode.move("west");
    }
    else if(entryid === "caminar_occidente"){
      avatarNode.move("east");
    }
  };


  /**
   * helper method
   * @param i
   * @param j
   * @param path
   * @returns {MuEngine.Node}
   */
  var putSprite = function(i, j, path){
    var sprite = new MuEngine.Sprite(path);
    sprite.width = 2.0;
    sprite.height = 2.0;
    sprite.anchor = sprite.ANCHOR_BOTTOM;
    var spriteNode = new MuEngine.Node(sprite);
    grid.getCell(i, j).addChild(spriteNode);
    return spriteNode;
  };

  /**
   * helper method
   * @param i
   * @param j
   * @param tiley
   * @returns {MuEngine.Node}
   */
  var putFruit = function(i, j, tiley){
    var sprite = new MuEngine.Sprite("assets/fruits.png");
    sprite.width = 1.5;
    sprite.height = 1.5;
    sprite.anchor = sprite.ANCHOR_BOTTOM;
    sprite.tilew = 64;
    sprite.tileh = 64;
    sprite.tiley = tiley;
    var spriteNode = new MuEngine.Node(sprite);
    spriteNode.transform.setPos(0.5, 0, 0.9);
    grid.getCell(i, j).addChild(spriteNode);
    return spriteNode;
  };



  return manager;

})(MuEngine);
//------

/**
 * muportalapp.js
 * app main module
 */
'use strict';

var muPortalApp = angular.module('muPortal', ['ngRoute', 'ui.bootstrap', 'localization']).
    config(['$routeProvider', function ($routeProvider) {

    	//configure navigation paths in client side
        $routeProvider.
            when('/', {templateUrl:'partials/welcome.html'}).
            when('/login', {templateUrl:'partials/login.html'}).
            when('/logout', {templateUrl:'partials/logout.html', controller:'logoutController'}).
            when('/register', {templateUrl:'partials/register.html'}).
            when('/welcome', {templateUrl:'partials/welcome.html'}).
            when('/profile', {templateUrl:'partials/profile.html', controller:'profileController'}).
            when('/contact', {templateUrl:'partials/contact.html'}).
            when('/virtualworld', {templateUrl:'partials/virtualworld.html', controller: 'virtualworldController'}).
            otherwise({redirectTo:'/'});
    
    }]);

muPortalApp.run(function($rootScope, $http) {
});

//------
/**
 * this service encapsulates the /login and /logout api endpoint.
 * it is in charge of setting and removing the authtoken and propagate
 */

muPortalApp.service("authsrv", [ "$rootScope", "$http", function($rootScope, $http){
  'use strict';

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
     * @cb success callback, signature function(errorcode). if null, it means login was successful.
     * error codes:
     * AUTHENTICATION_ERROR
     *
     */
	this.login= function(usr, psw, cb){
        var self = this;
        $http({
            method: 'POST',
            url: '/api/login',
            data: {usr: usr, psw:psw}
        }).
            success(function(data, status, headers, config) {
                $rootScope.authcode = self.ROLE_AUTH;
                $http.defaults.headers.common.Authorization = data.tkn;
                cb(null);
            }).
            error(function(data, status, headers, config) {
                console.log("error loggin in", data, status);
                cb("AUTHENTICATION_ERROR");
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
//------
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
//------
/**
 * this service encapsulate the /profile api endpoint 
 * and keeps the user profile in memory
 */
muPortalApp.service("profilesrv", ["$http", function($http){
  'use strict';

  var _profile = null;

	this.getProfile = function(cb){
		if(_profile){
      cb(_profile);
    }else{
      $http.get('api/profile')
        .success(function(data) {
          console.log("profilesrv.js:getProfile:", data);
          _profile = data;
          cb(_profile);
        });
    }
	};
	
	this.saveProfile = function(profile){
		console.log("profilesrv.js saving profile", profile);

    $http({
      url: 'api/profile',
      method: "POST",
      data: profile
    }).success(function (data, status, headers, config) {
        _profile = profile;
    }).error(function (data, status, headers, config) {
      console.log("profilesrv.js error saving profile", data, status);
    });



  };
	
}]);
//------
/**
 * Created by cesar on 6/18/14.
based on this article:
 http://www.frederiknakstad.com/2013/01/21/authentication-in-single-page-applications-with-angular-js/
 */

muPortalApp.directive('accessLevel', ['$rootScope', 'authsrv', function($rootScope, authsrv) {
  'use strict';
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var prevDisp = element.css('display');
                $rootScope.$watch('authcode', function(role) {
                    if(!authsrv.authorize(attrs.accessLevel))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                });
            }
        };
    }]);//------
/**
params: id
the id is used for:
labelledby: {{id}}_label
describedby: {{id}}_desc
i18n: _{{id}}_
i18n: _{{id}}_desc_
*/
muPortalApp.directive("muCheckbox", function () {
  'use strict';
  return {
    restrict: 'A',
    transclude: true,
    scope:true,
    link: function(scope, element, attrs) {

      scope.id = attrs['id'];

      var tokens = attrs['bindvar'].split('.');
      //"profile.group.item"
      //console.log(tokens);

      scope.bindvar = (scope.profile[tokens[1]])[tokens[2]];


    },
    templateUrl: "partials/mucheckbox.dir.html"
  };
});
//------

/**
 * controllers/authctrl.js
 * controller for the index
 */

muPortalApp.controller('authController', ["$scope", "$window", "authsrv", "profilesrv", function($scope, $window, authsrv, profilesrv) {
  'use strict';
    this.usr = null;
    this.psw = null;

    this.error = null;

    this.success = false;

    this.doLogin = function(){
        var self = this;
        authsrv.login(this.usr, this.psw, function(error){
            self.error = error;
            if(!self.error){
                //succefull login!
                self.success = true;
                //good point to pre-load the profile?? yeahp, at least for testing..
                profilesrv.getProfile(function(profile){
                   console.log("authController.login:loading profile: got: ", profile);
                });
            }
        });
    };

}]);//------

/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('contactController', ['contactsrv', function(contactsrv) {
  'use strict';
    this.name = null;
    this.email = null;
    this.message = null;

    this.error = null;

    this.doContact = function(){
        var self = this;
        //console.log("contactController.doContact ", this.name, this.email, this.message);
        contactsrv.sendMessage(this.name, this.email, this.message, function(error){
            self.error = error;
            if(self.error === null){
                console.log("contact message sent! how to notify the user?");
            }
            else{
                console.log("contact message failed! self.error had been set.");
            }
        });
    };

}]);//------

/**
 * controllers/logoutctrl.js
 * controller for the logout operation. it execute the logout code at construction time.
 */

muPortalApp.controller('logoutController', ["$scope", "$window", "authsrv", function($scope, $window, authsrv) {
  'use strict';
    authsrv.logout();

}]);//------

/**
 * controllers/mainctrl.js
 * controller for the index
 */

muPortalApp.controller('mainController', ["$rootScope", "$scope", "$window",
   function($rootScope, $scope, $window) {
     'use strict';
        /**
         * status inform the current screen and if the user is logged in.
         * @type {string}
         */
        this.status = "_login_anon_";

        /*var someText = {};
        someText.message = 'You have started your journey.';
        $scope.someText = someText;
        */

        $scope.locale = ($window.navigator.userLanguage || $window.navigator.language);
        console.log("your locale is: " +$scope.locale);

        /**
         * given a partialname, like "welcome_intro.html", return the relative
         * localized path, like "partials/en/welcome_intro.html"
         * @param partialname
         */
        $scope.getLocalizedPartial= function(partialname){
            return "partials/"+$scope.locale.substr(0, 2) + "/" + partialname;
        };

       /**
       *  keep track of changes in route to update the status bar
        */
       var self = this;
       $rootScope.$on("$routeChangeStart",function(event, next, current){
           console.log("routeChangeStart",next.originalPath);
           //parse the route (in the form "/path") to the form "_path_". we expect to match some i18n symbol!
           if(next.originalPath === "/")
            self.status ="_welcome_";
           else{
               self.status = "_"+next.originalPath.substring(1)+"_";
           }
       });



    } ]);//------

/**
 * controllers/logoutctrl.js
 * controller for the logout operation. it execute the logout code at construction time.
 */

muPortalApp.controller('profileController', ["$scope", "profilesrv", function($scope, profilesrv) {
  'use strict';

  $scope.profile = {
    sounds: null,
    engine: null,
    controls: null
  };

  profilesrv.getProfile(function(profile){
    $scope.profile = profile;
  });


  $scope.save = function(){
    console.log("saving profile:", $scope.profile);

    /**
     * temporal fix: right now the directive returns the "bindvar" string as the value of the fields that
     * had not changed. we are going to manually check here that everything is a boolean.

    function _checkField(group, item){
      if(($scope.profile[group])[item] !== true){ ($scope.profile[group])[item] = false;}
    }
    _checkField("sounds", "background");
    _checkField("sounds", "effects");
    _checkField("sounds", "narration");
    _checkField("engine", "clicktowalk");
    _checkField("engine", "mouse");
    _checkField("controls", "clickenabled");
    _checkField("controls", "requireconfirmation");

    console.log("cleaned profile:", $scope.profile);
     */
    profilesrv.saveProfile($scope.profile);

  };

  $scope.onChange = function(){
    console.log("something changed");
  };

}]);//------

/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('virtualworldController', ["$scope", "profilesrv", function($scope, profilesrv) {
  'use strict';


  var self = this;


  //game engine initialization
  this.init = function(profile){
    this.canvas = document.getElementById("c");
    this.manager  = new World01Manager(this.canvas, profile);

    //accessible controller initialization
    this.menu1 = new MuController.Menu("menu1", function(entryid){
      self.manager.onMenuEntryTriggered(entryid);
    });

    this.manager.build();

    this.manager.start();

    $scope.$on('$destroy', function () {
      self.manager.stop();
    });
  };

  profilesrv.getProfile(function(profile){
    self.init(profile);
  });


}]);
