angular.module('scroll', [])

.directive('whenScrolled', () ->
        restrict: 'A'

        link: (scope, element) ->

            element.bind('mousewheel', (event) ->
                if(event.originalEvent.wheelDelta < 0)
                    scope.$apply scope.loadDown
                else
                    scope.$apply scope.loadUp
                event.preventDefault();
            )
)