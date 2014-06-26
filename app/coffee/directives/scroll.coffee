angular.module('scroll', [])

.directive('whenScrolled', () ->
    (scope, element, attrs) ->

        width = scope.$eval(attrs.widthCell)

        element.bind('mousewheel', (event) ->
            st = $(this).scrollTop();
            if(event.originalEvent.wheelDelta < 0)
                element.scrollTop(st + width)
                console.log "Down"
                do scope.loadDown
            else
                element.scrollTop(st - width)
                console.log "Up"
                do scope.loadUp
            event.preventDefault();
            ###if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight)
                scope.$apply(attrs.whenScrolled)###
        )

)