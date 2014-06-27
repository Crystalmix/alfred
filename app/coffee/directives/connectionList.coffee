'use strict';
#
# connections = connections
# histories = histories
#

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
            $scope.counter = 0;

            $scope.subConnections = $scope.connections.slice($scope.counter, $scope.amount)
            $scope.counter += $scope.amount;

            $scope.selectedConnection = 0

            $scope.select = (connection, key) ->
                $scope.setSelectedConnection(key)
                console.log connection

            $scope.setSelectedConnection = (index) ->
                $scope.selectedConnection = index

            $scope.getSelectedConnection = () ->
                $scope.selectedConnection

            ###$scope.loadMore = (params) ->
                console.log $scope.subConnections
                if $scope.counter < $scope.connections.length
                    $scope.subConnections = $scope.subConnections.slice(0)
                    $scope.subConnections.push($scope.connections[$scope.counter])
                    $scope.counter += 1;
            ###

            $scope.loadUp = () ->
                console.log true

            $scope.loadDown = () ->
                if $scope.counter < $scope.connections.length
                    do $scope.subConnections.shift
                    $scope.subConnections.push($scope.connections[$scope.counter])
                    $scope.counter += 1;


            @somethingDo = () ->
                console.log '@somethingDo'


        link: (scope, element, attrs) ->
            $input = element.find('#alfred-input')

            setFocus = () ->
                do $input.focus

            activateNextItem = () ->
                index = scope.getSelectedConnection() + 1;
                console.log index
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

            $input.bind 'keydown', (e) =>
                if e.keyCode is 40
                    e.preventDefault();
                    do activateNextItem
                if e.keyCode is 38
                    e.preventDefault();
                    do activatePreviousItem


.directive "connectionItem",  () ->
        restrict: "A"
        require: "^connectionList"
        link: (scope, element, attrs, connectionListCtrl) ->
            element.bind 'mouseleave', () ->
                #do connectionListCtrl.somethingDo



