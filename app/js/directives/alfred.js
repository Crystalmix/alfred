(function() {
  'use strict';
  angular.module('connectionItemDirective', []).directive('connectionItem', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, ngModel) {
        return console.log(scope);
      }
    };
  });

}).call(this);
