angular.module('scroll', [])

.directive('whenScrolled', () ->
        restrict: 'A'

        link: (scope, element, attrs) ->

            ###
                Set element height
            ###
            amountOfCell = scope.amount
            widthCell = scope.$eval(attrs.widthCell)
            #element.height((amountOfCell-1) * (widthCell-1) + widthCell)
            #
            element.height(amountOfCell * widthCell)

            scope.setHeight = () ->
                height: widthCell + 'px'

            element.bind('mousewheel', (event) ->
                st = element.scrollTop();
                if(event.originalEvent.wheelDelta < 0)
                    do scope.loadDown
                    element.scrollTop(st + widthCell)
                else
                    do scope.loadUp
                    element.scrollTop(st - widthCell)
                event.preventDefault();
            )
)