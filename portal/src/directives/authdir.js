/**
 * Created by cesar on 6/18/14.
based on this article:
 http://www.frederiknakstad.com/2013/01/21/authentication-in-single-page-applications-with-angular-js/
 */

muPortalApp.directive('accessLevel', ['$rootScope', 'authsrv', function($rootScope, authsrv) {
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
    }]);