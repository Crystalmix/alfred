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
            $scope.from = 0;
            $scope.offset = $scope.amount;

            $scope.selectedConnection = 0

            $scope.select = (connection, key) ->
                $scope.setSelectedConnection(key)
                console.log connection

            $scope.setSelectedConnection = (index) ->
                $scope.selectedConnection = index

            $scope.getSelectedConnection = () ->
                $scope.selectedConnection

            $scope.loadUp = () ->
                if $scope.filteredConnections[$scope.from-1]
                    console.log $scope.filteredConnections
                    --$scope.from
                    --$scope.offset

            $scope.loadDown = () ->
                if $scope.filteredConnections[$scope.offset]
                    console.log $scope.filteredConnections
                    ++$scope.from
                    ++$scope.offset

            @somethingDo = () ->
                console.log '@somethingDo'


        link: (scope, element, attrs) ->
            $input = element.find('#alfred-input')

            setFocus = () ->
                do $input.focus

            activateNextItem = () ->
                current = element.find(".active")
                next = element.find(".active").next()
                if next.length
                    current.removeClass('active')
                    next.addClass('active')

            activatePreviousItem = () ->
                current = element.find(".active")
                prev = element.find(".active").prev()
                if prev.length
                    current.removeClass('active')
                    prev.addClass('active')

            scope.$watch $input, () =>
                do setFocus

            ###$input.bind 'keydown', (e) =>
                if e.keyCode is 40
                    e.preventDefault();
                    do activateNextItem
                if e.keyCode is 38
                    e.preventDefault();
                    do activatePreviousItem
            ###


.directive "connectionItem",  () ->
        restrict: "A"
        require: "^connectionList"
        link: (scope, element, attrs, connectionListCtrl) ->
            element.bind 'mouseleave', () ->
                #do connectionListCtrl.somethingDo


.filter 'filterConnections', ['$filter', ($filter) ->
        (input, query, arg1, arg2) ->
            filterFilter = $filter('filter')
            @filteredConnections = filterFilter @connections, query
            return @filteredConnections.slice arg1, arg2
    ]
