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
            console.log $scope

        link: (scope, element, attrs) ->
            $input = element.find('#alfred-input')

            setFocus = () ->
                do $input.focus

            scope.$watch $input, () =>
                do setFocus
            scope.isTable = yes
            scope.isLeftActive = yes
            scope.isRightActive = no

            if scope.isLeftActive
                scope.notActiveConnections = scope.histories.slice(0, scope.amount)
            else
                scope.notActiveConnections = scope.connections.slice(0, scope.amount)

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
                ), 10
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


.directive "connectionList",  () ->
        restrict: "AE"
        templateUrl: "partials/connections.html"
        scope:
            connections: "="
            amount:      "="
            widthCell:   "="


        # subConnetions is a visible array
        controller: ($scope) ->

            $scope.isTable = true;

            $scope.select = (connection, key) ->
                $scope.setSelectedConnection(key)
                console.log connection

            $scope.setSelectedConnection = (index) ->
                $scope.selectedIndex = index

            $scope.getSelectedConnection = () ->
                $scope.selectedIndex

            $scope.initParameters = () ->
                $scope.from = 0
                $scope.offset = $scope.amount
                $scope.selectedIndex = 0

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


        link: (scope, element, attrs) ->
            scope.prevquery = scope.query = null


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
