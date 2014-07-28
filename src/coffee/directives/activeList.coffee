
alfredDirective.directive "activeList",  () ->
        ###
            connections         --  array of all hosts
            filteredConnections --  array of queried hosts
            subConnections      --  array of visible hosts
        ###
        require: "^alfred"
        restrict: "AE"
        templateUrl: "/src/templates/active-connections.html"
        scope:
            connections:     "="
            amount:          "="
            heightCell:      "="
            query:           "="
            from:            "="
            selectedIndex:   "="
            cmdSystemHotkey: "="
            rest: "="

        # subConnetions is a visible array
        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'

            $scope.setSizerHeight = () ->
                height: $scope.sizer + '%'

            $scope.setSliderHeight = () ->
                height: $scope.slider + '%'

            $scope.changeOffset = () ->
                $scope.offset = $scope.from + $scope.amount

            $scope.initializeParameteres = () ->
                $scope.from = 0
                $scope.setSelectedConnection 0

            $scope.select = (connection, key) ->
                $scope.setSelectedConnection key
                $scope.alfredController.enterCallback connection

            $scope.setSelectedConnection = (index) ->
                $scope.selectedIndex = index

            $scope.getSelectedConnection = () ->
                $scope.selectedIndex

            $scope.loadUp = () ->
                if $scope.filteredConnections[$scope.from-1]
                    --$scope.from
                    --$scope.offset

            $scope.loadDown = () ->
                if $scope.filteredConnections[$scope.offset]
                    ++$scope.from
                    ++$scope.offset

            ###*
            * Checking history entity
            ###
            $scope.isHistory = (connection) ->
                if connection.id?
                    return no
                return yes

            @select = (key) ->
                $scope.setSelectedConnection key
                do $scope.$apply

            do $scope.changeOffset

            return @


        link: (scope, element, attrs, alfredCtrl) ->
            # Check if list length is more than amount of cells
            scope.selectedIndex = if scope.selectedIndex >= scope.connections.length then (scope.connections.length-1) else scope.selectedIndex

            scope.alfredController = alfredCtrl
            scope.prevquery = null

            # Template icons
            scope.enterText = '↩'
            scope.cmdSystemHotkey = if scope.cmdSystemHotkey is "command" then "⌘" else "Ctrl"

            scope.$watch "selectedIndex", (key) ->
                alfredCtrl.setSelectedIndex(key)

            scope.$watch "from", (from) ->
                scope.offset = scope.from + scope.amount
                alfredCtrl.changeFromProperty(from)

            scope.$on('arrow', (event, orientation) ->
                if orientation is 'up'
                    do activatePreviousItem
                else
                    do activateNextItem
            )

            scope.$on('setSelectedIndex', (event, key) ->
                scope.selectedIndex = key
            )

            scope.$on('enter', () ->
                key = scope.getSelectedConnection()
                connection = scope.subConnections[key]
                scope.select connection, key
            )

            scope.edit = ($event, connection) ->
                do $event.preventDefault
                do $event.stopPropagation
                alfredCtrl.edit(connection)

            scope.remove = ($event, connection) ->
                do $event.preventDefault
                do $event.stopPropagation
                alfredCtrl.remove(connection)

            scope.changeSlider = () ->
                slider = (scope.amount * 100) / scope.filteredConnections.length
                sizer = (scope.from * 100) / scope.filteredConnections.length
                sizes = scope._normalizeSliderHeight(slider, sizer)
                scope.slider = sizes.sliderHeight
                scope.sizer = sizes.sizerHeight

            scope._normalizeSliderHeight = (sliderHeight, sizerHeight) ->
                if sizerHeight > 100 - sliderHeight
                    sizerHeight = 100 - sliderHeight
                if  sliderHeight > 100
                    sliderHeight = 100
                sliderHeight *= 100;
                sizerHeight *= 100;
                sizerHeight = Math.floor(sizerHeight) / 100;
                sliderHeight = Math.ceil(sliderHeight) / 100;

                return {sliderHeight: sliderHeight, sizerHeight: sizerHeight};

            activateNextItem = () ->
                current = element.find(".active")
                next = current.next()
                currentIndex = scope.getSelectedConnection()
                if next.length is 0 or not next[0].id
                    do scope.loadDown
                    setTimeout (->
                        next = current.next()
                        if next.length is 0 or not next[0].id
                            scope.from   = 0
                            scope.offset = scope.amount
                            scope.setSelectedConnection(0)
                            scope.$apply()
                    ), 0
                else
                    scope.setSelectedConnection(++currentIndex)

            activatePreviousItem = () ->
                current = element.find(".active")
                prev = current.prev()
                currentIndex = scope.getSelectedConnection()
                if prev.length is 0 or not prev[0].id
                    do scope.loadUp
                    setTimeout (->
                        prev = current.prev()
                        if prev.length is 0 or not prev[0].id
                            from = scope.filteredConnections.length - scope.amount
                            if from > 0
                                scope.from   = from
                                scope.offset = scope.filteredConnections.length - 1
                                scope.setSelectedConnection(scope.amount - 1)
                            else
                                scope.setSelectedConnection(scope.filteredConnections.length - 1)
                            scope.$apply()
                    ), 0
                else
                    scope.setSelectedConnection(--currentIndex)
