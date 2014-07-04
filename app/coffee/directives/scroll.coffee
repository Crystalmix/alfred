angular.module('scroll', [])

.directive('whenScrolled', () ->
        restrict: 'A'

        link: (scope, element, attrs) ->

            ###
                Set element height
            ###
            #amountOfCell = scope.amount
           # widthCell = scope.$eval(attrs.widthCell)
            #element.height amountOfCell * widthCell + 1

            #scope.setHeight = () ->
            #    height: widthCell + 'px'

            element.bind('mousewheel', (event) ->
                if(event.originalEvent.wheelDelta < 0)
                    scope.$apply scope.loadDown
                else
                    scope.$apply scope.loadUp
                event.preventDefault();
            )
)