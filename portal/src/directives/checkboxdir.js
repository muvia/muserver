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
    restrict: 'E',
    replace: true,
    scope:{
      id: "="
    },
    link: function(scope, element, attrs) {
      scope.id = attrs['id'];
    },
    template: '<div class="form-group">'+
    '<label id="{{id}}_label"  class="col-sm-2 control-label" for="{{id}}" data-i18n="_{{id}}_"></label>'+
        '<div class="col-sm-10">'+
            '<input id="{{id}}" type="checkbox" value="" aria-labelledby="{{id}}_label" aria-describedby="{{id}}_desc" >'+
            '<span id="{{id}}_desc" data-i18n="_{{id}}_desc_" ></span>'+
        '</div>'+
    '</div>'

  };
});
