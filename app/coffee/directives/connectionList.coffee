'use strict';
#
# connections = connections
# histories = histories
#

###
    connections         --  array of all hosts
    filteredConnections --  array of queried hosts
    subConnections      --  array of visible hosts
###

angular.module("alfredDirective", [])

.directive "connectionList",  () ->
        restrict: "E"
        templateUrl: "partials/connectionList.html"
        replace: yes
        transclude: yes
        scope:
            connections: "="
            amount: "="

        # subConnetions is a visible array
        controller: ($scope) ->

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

            $input = element.find('#alfred-input')

            setFocus = () ->
                do $input.focus

            #scope.$watch $input, () =>
            #    do setFocus

            $input.bind 'keydown', (e) =>
                if e.keyCode is 40
                    e.preventDefault();
                    do activateNextItem
                if e.keyCode is 38
                    e.preventDefault();
                    do activatePreviousItem

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

