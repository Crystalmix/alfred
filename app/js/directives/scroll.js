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
        element.height(amountOfCell * widthCell);
        scope.setHeight = function() {
          return {
            height: widthCell + 'px'
          };
        };
        return element.bind('mousewheel', function(event) {
          var st;
          st = element.scrollTop();
          if (event.originalEvent.wheelDelta < 0) {
            scope.loadDown();
            element.scrollTop(st + widthCell);
          } else {
            scope.loadUp();
            element.scrollTop(st - widthCell);
          }
          return event.preventDefault();
        });
      }
    };
  });

}).call(this);
