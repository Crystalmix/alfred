(function() {
  angular.module('scroll', []).directive('whenScrolled', function() {
    return function(scope, element, attrs) {
      var width;
      width = scope.$eval(attrs.widthCell);
      return element.bind('mousewheel', function(event) {
        var st;
        st = $(this).scrollTop();
        if (event.originalEvent.wheelDelta < 0) {
          element.scrollTop(st + width);
          console.log("Down");
          scope.loadDown();
        } else {
          element.scrollTop(st - width);
          console.log("Up");
          scope.loadUp();
        }
        return event.preventDefault();

        /*if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight)
            scope.$apply(attrs.whenScrolled)
         */
      });
    };
  });

}).call(this);
