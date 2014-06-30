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

            @somethingDo = () ->
                console.log '@somethingDo'

            $scope.initFromOffset = () ->
                $scope.from = 0;
                $scope.offset = $scope.amount

            do $scope.initFromOffset


        link: (scope, element, attrs) ->
            scope.prevquery = scope.query = null

            $input = element.find('#alfred-input')

            setFocus = () ->
                do $input.focus

            scope.$watch $input, () =>
                do setFocus

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
            element.bind "mouseleave", () ->
                #do connectionListCtrl.somethingDo


.filter "filterConnections", ["$filter", ($filter) ->
        (input, query, arg1, arg2) ->
            if @prevquery isnt @query
                @initFromOffset()
                @prevquery = @query
            filterFilter = $filter("filter")
            @filteredConnections = filterFilter @connections, query
            return @filteredConnections.slice arg1, arg2
    ]
