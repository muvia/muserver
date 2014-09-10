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
