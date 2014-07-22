(function() {
  angular.module('scroll', []).directive('whenScrolled', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        return element.bind('mousewheel', function(event) {
          if (event.originalEvent.wheelDelta < 0) {
            scope.$apply(scope.loadDown);
          } else {
            scope.$apply(scope.loadUp);
          }
          return event.preventDefault();
        });
      }
    };
  });

}).call(this);
