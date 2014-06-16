/*
 * An AngularJS Localization Service
 *
 * Written by Jim Lavin
 * http://codingsmackdown.tv
 *
 */

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
                    };
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

/**
 * muportalapp.js
 * app main module
 */
'use strict';

var muPortalApp = angular.module('muPortal', ['ngRoute', 'localization', 'ui.bootstrap', 'UserApp']).
    config(['$routeProvider', function ($routeProvider) {
        
    	//configure navigation paths in client side
        $routeProvider.
            when('/', {templateUrl:'partials/welcome.html', controller:"mainController"}).
            when('/login', {templateUrl:'partials/login.html', controller:"authController", public: true}).
            when('/register', {templateUrl:'partials/register.html', controller:"authController", public: true}).
            when('/welcome', {templateUrl:'partials/welcome.html', controller:"mainController", login: true}).
            when('/profile', {templateUrl:'partials/profile.html', controller:"mainController", login: true}).
            when('/virtualworld', {templateUrl:'partials/virtualworld.html', controller:"mainController", login: true}).
            otherwise({redirectTo:'/'});
    
    }]);

muPortalApp.run(function($rootScope, $http, user) {
    user.init({
    	appId: '53739ca105ab1',
		heartbeatInterval: 0 
    });
    
	//add and remove auth token from session headers so they are available on server side 
    //https://app.userapp.io/#/docs/libs/angularjs/#heartbeats
	$rootScope.$on('user.login', function() {
		console.log('adding auth token to headers ' + user.token());
		$http.defaults.headers.common.Authorization = 'Basic ' + btoa(':' + user.token());
	});
	
	$rootScope.$on('user.logout', function() {
		console.log('removing auth token from headers ');
		$http.defaults.headers.common.Authorization = null;
	});

});

//------

/**
 * controllers/mainctrl.js
 * controller for the index
 */

muPortalApp.controller('mainController',
    function($scope, $window) {

        /*var someText = {};
        someText.message = 'You have started your journey.';
        $scope.someText = someText;
        */

        $scope.locale = ($window.navigator.userLanguage || $window.navigator.language)
        console.log("your locale is: " +$scope.locale);

        /**
         * given a partialname, like "welcome_intro.html", return the relative
         * localized path, like "partials/en/welcome_intro.html"
         * @param partialname
         */
        $scope.getLocalizedPartial= function(partialname){
            return "partials/"+$scope.locale.substr(0, 2) + "/" + partialname;
        }

    });//------

/**
 * controllers/authctrl.js
 * controller for the index
 */

muPortalApp.controller('authController',
    function($scope, $window) {


    });