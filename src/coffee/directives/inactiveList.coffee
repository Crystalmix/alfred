
alfredDirective.directive "inactiveList",  () ->
        require: "^alfred"
        restrict: "AE"
        templateUrl: "/src/templates/inactive-connections.html"
        scope:
            connections:   "="
            amount:        "="
            heightCell:    "="
            from:          "="
            rest: "="

        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'

            $scope.setSizerHeight = () ->
                height: ($scope.from * 100) / $scope.connections.length + '%'

            $scope.setSliderHeight = () ->
                height: ($scope.amount * 100) / $scope.connections.length + '%'

            $scope.changeOffset = () ->
                $scope.offset = $scope.from + $scope.amount

        link: (scope, element, attrs, alfredCtrl) ->
            do scope.changeOffset

            element.bind "mouseenter", () ->
                if scope.connections.length
                    do alfredCtrl.changeActiveList

            scope._normalizeSliderHeight = (sliderHeight, sizerHeight) ->
                if sizerHeight > 100 - sliderHeight
                    sizerHeight = 100 - sliderHeight
                if  sliderHeight > 100
                    sliderHeight = 100
                sliderHeight *= 100;
                sizerHeight *= 100;
                sizerHeight = Math.floor(sizerHeight) / 100
                sliderHeight = Math.ceil(sliderHeight) / 100

                return {sliderHeight: sliderHeight, sizerHeight: sizerHeight}

            scope.changeSlider = () ->
                slider = (scope.amount * 100) / scope.filteredConnections.length
                sizer = (scope.from * 100) / scope.filteredConnections.length
                sizes = scope._normalizeSliderHeight(slider, sizer)
                scope.slider = sizes.sliderHeight
                scope.sizer = sizes.sizerHeight
