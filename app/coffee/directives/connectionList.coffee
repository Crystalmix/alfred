'use strict';

###
    connections         --  array of all hosts
    filteredConnections --  array of queried hosts
    subConnections      --  array of visible hosts
###

angular.module("alfredDirective", [])

.directive "alfred", () ->
        restrict: "E"
        templateUrl: "partials/alfred.html"
        replace: yes
        transclude: yes
        scope:
            connections: "="
            histories:   "="
            amount:      "="
            widthCell:   "="

        controller: ($scope) ->


            @changeFrom = (index) ->
                $scope.fromConnection = index


        link: (scope, element, attrs) ->
            $input = element.find('#alfred-input')

            setFocus = () ->
                do $input.focus

            scope.$watch $input, () =>
                do setFocus

            scope.$watch "isTable", () ->
                if scope.isTable
                    scope.fromConnection = 0
                    scope.fromHistory    = 0

            scope.isTable = yes
            scope.isLeftActive = yes
            scope.isRightActive = no

            checkQuery = () ->
                if scope.query
                    scope.isTable = no
                    do scope.$apply
                else
                    scope.isTable = yes
                    do scope.$apply

            scope.keydown = (event) ->
                setTimeout (->
                    do checkQuery
                ), 0
                if event.keyCode is 37 or event.keyCode is 39
                    scope.isLeftActive  = yes
                    scope.isRightActive = no
                if event.keyCode is 39
                    scope.isLeftActive  = no
                    scope.isRightActive = yes




.directive "connectionListNotActive",  () ->
        restrict: "AE"
        templateUrl: "partials/connections-not-active.html"
        scope:
            connections: "="
            amount:      "="
            widthCell:   "="
            from:        "="

        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.widthCell + 'px'

            $scope.setHeightList = () ->
                height: $scope.amount * $scope.widthCell

            $scope.initParameters = () ->
                $scope.from = $scope.from
                $scope.offset = $scope.from + $scope.amount
                $scope.selectedIndex = 0

        link: (scope, element, attrs) ->
            do scope.initParameters



.directive "connectionList",  () ->
        restrict: "AE"
        require: "^alfred"
        templateUrl: "partials/connections.html"
        scope:
            connections: "="
            amount:      "="
            widthCell:   "="
            query:       "=scopeQuery"
            from:        "="

        # subConnetions is a visible array
        controller: ($scope) ->

            $scope.setHeight = () ->
                height: $scope.widthCell + 'px'

            $scope.setHeightList = () ->
                height: $scope.amount * $scope.widthCell

            $scope.initParameters = () ->
                $scope.from = $scope.from
                $scope.offset = $scope.from + $scope.amount
                $scope.selectedIndex = 0

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
            scope.prevquery = scope.query = null

            ###scope.$watch "from", () ->
                if scope.from isnt 0
                    if scope.$parent.$parent.isRightActive
                        ++ scope.$parent.$parent.fromHistory
                        scope.$apply()
                    if scope.$parent.$parent.isLeftActive
                        ++ scope.$parent.$parent.fromConnectoins
                        scope.$apply()
            ###

            ###$input.bind 'keydown', (e) =>
                if e.keyCode is 40
                    e.preventDefault();
                    do activateNextItem
                if e.keyCode is 38
                    e.preventDefault();
                    do activatePreviousItem
            ###
            activateNextItem = () ->
                current = element.find(".active")
                next = current.next()
                currentIndex = scope.getSelectedConnection()
                if next.length is 0
                    scope.$apply scope.loadDown
                    next = current.next()
                    if next.length isnt 0
                        scope.$apply scope.setSelectedConnection(currentIndex)
                else
                    scope.$apply scope.setSelectedConnection(++currentIndex)

            activatePreviousItem = () ->
                current = element.find(".active")
                prev = current.prev()
                currentIndex = scope.getSelectedConnection()
                if prev.length is 0
                    scope.$apply scope.loadUp
                    prev = current.prev()
                    if prev.length isnt 0
                        scope.$apply scope.setSelectedConnection(currentIndex)
                else
                    scope.$apply scope.setSelectedConnection(--currentIndex)


.directive "connectionItem",  () ->
        restrict: "A"
        require: "^connectionList"

        link: (scope, element, attrs, connectionListCtrl) ->
            element.bind "mouseenter", () ->
                connectionListCtrl.select scope.key


.filter "filterConnections", ["$filter", ($filter) ->
        (input, scope, arg1, arg2) ->
            if scope.prevquery isnt scope.query
                scope.initParameters()
                scope.prevquery = scope.query
            filterFilter = $filter("filter")
            scope.filteredConnections = filterFilter scope.connections, scope.query
            return scope.filteredConnections.slice arg1, arg2
    ]
