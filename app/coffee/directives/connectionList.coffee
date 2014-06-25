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

        controller: ($scope) ->
            $scope.selectedConnection = 0

            $scope.select = (connection, key) ->
                $scope.setSelectedConnection(key)
                console.log connection

            $scope.setSelectedConnection = (index) ->
                $scope.selectedConnection = index

            $scope.getSelectedConnection = () ->
                $scope.selectedConnection


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

            $input.bind 'keydown', (e) =>
                if e.keyCode is 40
                    e.preventDefault();
                    do activateNextItem
                if e.keyCode is 38
                    e.preventDefault();
                    do activatePreviousItem
