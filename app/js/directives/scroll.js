(function() {
  angular.module('scroll', []).directive('whenScrolled', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {

        /*
            Set element height
         */
        var amountOfCell, widthCell;
        amountOfCell = scope.amount;
        widthCell = scope.$eval(attrs.widthCell);
        element.height(amountOfCell * widthCell + 1);
        scope.setHeight = function() {
          return {
            height: widthCell + 'px'
          };
        };
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
