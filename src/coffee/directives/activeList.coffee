
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
            heightCell:      "="
            query:           "="
            selectedIndex:   "="
            currentGroup:    "="
            uid:             "="

        controller: ($scope) ->

            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'


            $scope.safeApply = (expr) ->
                unless $scope.$$phase
                    if expr then $scope.$apply expr else do $scope.$apply


            # Method api for child directive
            @select = (key) ->
                $scope.setSelectedConnection key
                do $scope.safeApply

            return @


        link: (scope, element, attrs, alfredCtrl) ->

            # Saves parent controller at the scope variable
            scope.alfredController = alfredCtrl

            scope.$watch "selectedIndex", (key) ->
                alfredCtrl.setSelectedIndex(key)


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
                if scope.filteredConnections[key]?
                    scope.setSelectedConnection(key)
                    connection = scope.filteredConnections[key]
                    scope.connect connection, key
            )
            # End Listens to parent events 'quickConnect'


            scope.edit = (connection) ->
                always_open_form = yes
                alfredCtrl.edit(connection, always_open_form)


            scope.remove = (connection) ->
                alfredCtrl.removeConnection(connection)


            scope.select = (key) ->
                scope.setSelectedConnection key
                always_open_form = no
                alfredCtrl.edit(scope.filteredConnections[key], always_open_form)


            scope.connect = (connection, key) ->
                scope.select key
                alfredCtrl.enterCallback connection
                return no


            scope.setSelectedConnection = (index) ->
                scope.selectedIndex = index


            scope.getSelectedConnection = () ->
                scope.selectedIndex


            activateNextItem = () ->
                currentIndex = scope.getSelectedConnection()
                next = scope.filteredConnections[currentIndex+1]
                # Checks is next element?
                unless next?
                    scope.setSelectedConnection(0)
                else
                    scope.setSelectedConnection(++currentIndex)


            activatePreviousItem = () ->
                currentIndex = scope.getSelectedConnection()
                prev = scope.filteredConnections[currentIndex-1]
                # Checks is prev element?
                unless prev?
                    scope.setSelectedConnection(scope.filteredConnections.length - 1)
                else
                    scope.setSelectedConnection(--currentIndex)
