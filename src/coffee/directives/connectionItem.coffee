
alfredDirective.directive "connectionItem",  () ->
        restrict: "A"
        require: "^activeList"

        link: (scope, element, attrs, connectionListCtrl) ->
            element.bind "mouseenter", () ->
                connectionListCtrl.select scope.key