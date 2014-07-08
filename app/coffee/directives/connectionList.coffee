'use strict';

alfredDirective = angular.module("alfredDirective", [])


alfredDirective.directive "alfred", () ->
        restrict: "E"
        templateUrl: "partials/alfred.html"
        replace: yes
        transclude: yes
        scope:
            connections:  "="
            histories:    "="
            amount:       "="
            heightCell:   "="

        controller: ($scope) ->
            $scope.query = null
            $scope.entities = $scope.connections.concat $scope.histories

            $scope.selectedIndex = 0

            $scope.setSelectedConnection = (index) ->
                $scope.selectedIndex = index

            @setSelectedIndex = (key) ->
                $scope.setSelectedConnection key
                do $scope.$apply

            #@changeFrom = (index) ->
            #    $scope.fromConnection = index


        link: (scope, element) ->
            $input = element.find '#alfred-input'

            setFocus = () ->
                do $input.focus

            scope.$watch $input, () =>
                do setFocus


            scope.$watch "isTable", () ->
                if scope.isTable
                    do initParameters

            scope.isTable = yes
            scope.isLeftActive = yes
            scope.isRightActive = no

            checkQuery = () ->
                if scope.query
                    scope.isTable = no
                else
                    scope.isTable = yes
                do scope.$apply

            initParameters = () ->
                scope.fromConnection = 0
                scope.fromHistory    = 0
                scope.selectedIndex  = 0

            scope.keydown = (event) ->
                setTimeout (->
                    do checkQuery
                ), 0
                if scope.isTable
                    if event.keyCode is 37
                        scope.isLeftActive  = yes
                        scope.isRightActive = no
                    if event.keyCode is 39
                        scope.isLeftActive  = no
                        scope.isRightActive = yes
                if event.keyCode is 38
                    scope.$broadcast "arrow", "up"
                if event.keyCode is 40
                    scope.$broadcast "arrow", "down"
            do initParameters


alfredDirective.directive "inactiveList",  () ->
        restrict: "AE"
        templateUrl: "partials/inactive-connections.html"
        scope:
            connections:   "="
            amount:        "="
            heightCell:    "="
            from:          "="

        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'

            $scope.setHeightList = () ->
                height: $scope.amount * $scope.heightCell

            $scope.initParameters = () ->
                $scope.offset = $scope.from + $scope.amount

        link: (scope) ->
            do scope.initParameters


alfredDirective.directive "activeList",  () ->
        ###
            connections         --  array of all hosts
            filteredConnections --  array of queried hosts
            subConnections      --  array of visible hosts
        ###
        require: "^alfred"
        restrict: "AE"
        templateUrl: "partials/active-connections.html"
        scope:
            connections:   "="
            amount:        "="
            heightCell:    "="
            query:         "="
            from:          "="
            selectedIndex: "="

        # subConnetions is a visible array
        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'

            $scope.setHeightList = () ->
                height: $scope.amount * $scope.heightCell

            $scope.initParameters = () ->
                $scope.offset = $scope.from + $scope.amount

            $scope.select = (connection, key) ->
                $scope.setSelectedConnection(key)
                console.log connection

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

            @select = (key) ->
                $scope.setSelectedConnection key
                do $scope.$apply

            do $scope.initParameters


        link: (scope, element, attrs, alfredCtrl) ->

            scope.prevquery = null
            scope.offset    = scope.from + scope.amount

            scope.$watch "selectedIndex", (key) ->
                #TODO call parent controller
                scope.$parent.$parent.selectedIndex = key

            scope.$on('arrow', (event, orientation) ->
                if orientation is 'up'
                    do activatePreviousItem
                else
                    do activateNextItem
            );

            scope.$watch "from", () ->
                scope.offset = scope.from + scope.amount

            activateNextItem = () ->
                current = element.find(".active")
                next = current.next()
                currentIndex = scope.getSelectedConnection()
                if next.length is 0
                    do scope.loadDown
                    setTimeout (->
                        next = current.next()
                        if next.length is 0
                            scope.from   = 0
                            scope.offset = scope.amount
                            scope.setSelectedConnection(0)
                            scope.$apply()
                    ), 100
                else
                    scope.setSelectedConnection(++currentIndex)

            activatePreviousItem = () ->
                current = element.find(".active")
                prev = current.prev()
                currentIndex = scope.getSelectedConnection()
                if prev.length is 0
                    do scope.loadUp
                    setTimeout (->
                        prev = current.prev()
                        if prev.length is 0
                            from = scope.filteredConnections.length - scope.amount
                            if from > 0
                                scope.from   = from
                                scope.offset = scope.filteredConnections.length - 1
                                scope.setSelectedConnection(scope.amount - 1)
                            else
                                scope.setSelectedConnection(scope.filteredConnections.length - 1)
                            scope.$apply()
                    ), 100
                else
                    scope.setSelectedConnection(--currentIndex)


alfredDirective.directive "connectionItem",  () ->
        restrict: "A"
        require: "^activeList"

        link: (scope, element, attrs, connectionListCtrl) ->
            element.bind "mouseenter", () ->
                connectionListCtrl.select scope.key


alfredDirective.filter "filterConnections", ["$filter", ($filter) ->
        (input, query, arg1, arg2) ->
            scope = this
            if scope.prevquery isnt scope.query
                scope.initParameters()
                scope.prevquery = scope.query
            filterFilter = $filter("filter")
            scope.filteredConnections = filterFilter scope.connections, scope.query
            console.log "query #{scope.query}"
            console.log arg1, arg2, scope.filteredConnections.length
            return scope.filteredConnections.slice arg1, arg2
    ]
