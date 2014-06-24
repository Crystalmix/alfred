(function() {
  'use strict';
  angular.module('connectionItemDirective', []).directive('connectionItem', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, controller) {
        var item, key;
        console.log(scope);
        item = scope.$eval(attrs.connectionItem);
        key = scope.$eval(attrs.key);
        return scope.$watch(function() {
          if (key === 0) {
            return element.addClass('active');
          }
        }, function(active) {
          if (active) {
            return element.addClass('active');
          } else {
            return element.removeClass('active');
          }
        });

        /*element.bind('mouseenter', (e) =>
            scope.$apply(() ->
                controller.activate(item);
            );
        );
        
        element.bind('click', (e) =>
            scope.$apply(() ->
                 controller.select(item);
            );
        );
         */
      }
    };
  });

}).call(this);
