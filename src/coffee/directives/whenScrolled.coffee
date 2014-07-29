
###
    The whenScrolled directive displays active list with all hotkeys handlers

    connections         --  array of all json-objects
    filteredConnections --  array of queried json-objects
    subConnections      --  array of visible json-objects
###
alfredDirective.directive('whenScrolled', () ->
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