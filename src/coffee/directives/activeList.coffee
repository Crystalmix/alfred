
###
    The activeList directive displays active list with all hotkeys handlers

    connections         --  array of all json-objects
    filteredConnections --  array of queried json-objects
    subConnections      --  array of visible json-objects
###
alfredDirective.directive "activeList",  () ->
        require: "^alfred"
        restrict: "AE"
        templateUrl: "src/templates/active-connections.html"
        scope:
            connections:     "="
            amount:          "="
            heightCell:      "="
            query:           "="
            from:            "="
            selectedIndex:   "="
            cmdSystemHotkey: "="
            rest:            "="

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

            $scope.select = ($event, connection, key) ->
                do $event.preventDefault
                do $event.stopPropagation
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

            # Checks is it history entity
            #
            #@param connection    json-object
            $scope.isHistory = (connection) ->
                if connection.is_history
                    return yes
                return no

            # Method api for child directive
            @select = (key) ->
                $scope.setSelectedConnection key
                do $scope.$apply

            do $scope.changeOffset

            return @


        link: (scope, element, attrs, alfredCtrl) ->
            # Checks if list length is less than amount of cells
            scope.selectedIndex = if scope.selectedIndex >= scope.connections.length then (scope.connections.length-1) else scope.selectedIndex

            # Saves parent controller at the scope variable
            scope.alfredController = alfredCtrl
            scope.prevquery = null

            # Template icons
            scope.enterText = '↩'
            scope.cmdSystemHotkey = if scope.cmdSystemHotkey is "⌘" then "⌘" else "Ctrl"

            scope.$watch "selectedIndex", (key) ->
                alfredCtrl.setSelectedIndex(key)

            scope.$watch "from", (from) ->
                scope.offset = scope.from + scope.amount
                alfredCtrl.changeFromProperty(from)

            # Listens to parent events 'arrow'
            #
            # @param event          jQuery event
            # @param orientation    ↓ or ↑
            scope.$on('arrow', (event, orientation) ->
                if orientation is 'up'
                    do activatePreviousItem
                else
                    do activateNextItem
            )

            # Listens to parent events 'setSelectedIndex'
            #
            # @param event    jQuery event
            # @param key      index within [1-scope.amount]
            scope.$on('setSelectedIndex', (event, key) ->
                scope.selectedIndex = key
            )

            # Listens to parent events 'enter'
            scope.$on('enter', (event, key) ->
                unless key?
                    key = scope.getSelectedConnection()
                if scope.subConnections[key]?
                    scope.setSelectedConnection(key)
                    connection = scope.subConnections[key]
                    scope.select connection, key
            )

            # Listens to parent events 'quickConnect'
            #
            # @param event    jQuery event
            # @param params   parameters from command quick connection
            scope.$on('quickConnect', (event, params) ->
                scope.quickConnectionsParams = params
                do scope.$apply
            )

            scope.addConnection = ($event) ->
                do $event.preventDefault
                do $event.stopPropagation
                alfredCtrl.addConnection()

            scope.edit = ($event, connection) ->
                do $event.preventDefault
                do $event.stopPropagation
                alfredCtrl.edit(connection)

            scope.upload = ($event, connection) ->
                do $event.preventDefault
                do $event.stopPropagation
                alfredCtrl.upload(connection)

            scope.remove = ($event, connection) ->
                do $event.preventDefault
                do $event.stopPropagation
                alfredCtrl.remove(connection)

            scope.changeSlider = () ->
                slider = (scope.amount * 100) / scope.filteredConnections.length
                sizer = (scope.from * 100) / scope.filteredConnections.length
                sizes = _normalizeSliderHeight(slider, sizer)
                scope.slider = sizes.sliderHeight
                scope.sizer = sizes.sizerHeight

            _normalizeSliderHeight = (sliderHeight, sizerHeight) ->
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
                currentIndex = scope.getSelectedConnection()
                next = scope.subConnections[currentIndex+1]
                # Checks is next element?
                unless next?
                    if _.isEqual(_.last(scope.subConnections), _.last(scope.filteredConnections))
                        scope.from   = 0
                        scope.offset = scope.amount
                        scope.setSelectedConnection(0)
                    else
                        do scope.loadDown
                else
                    scope.setSelectedConnection(++currentIndex)

            activatePreviousItem = () ->
                currentIndex = scope.getSelectedConnection()
                prev = scope.subConnections[currentIndex-1]
                # Checks is prev element?
                unless prev?
                    if _.isEqual(_.first(scope.subConnections), _.first(scope.filteredConnections))
                        from = scope.filteredConnections.length - scope.amount
                        if from > 0
                            scope.from   = from
                            scope.offset = scope.filteredConnections.length - 1
                            scope.setSelectedConnection(scope.amount - 1)
                        else
                            scope.setSelectedConnection(scope.filteredConnections.length - 1)
                    else
                        do scope.loadUp
                else
                    scope.setSelectedConnection(--currentIndex)
