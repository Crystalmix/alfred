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
            $scope.connections = []
            $scope.hide = no

            @activate = (item) ->
                $scope.active = item

            this.activateNextItem = () ->
                index = $scope.connections.indexOf($scope.active);
                this.activate($scope.connections[(index + 1) % $scope.connections.length]);

            @activatePreviousItem = () ->
                index = $scope.items.indexOf($scope.active);
                this.activate($scope.connections[index is 0 ? $scope.connections.length - 1 : index - 1]);

            @isActive = (item) ->
                $scope.active is item

            @selectActive = () ->
                @select($scope.active)

            @select = (item) ->
                $scope.hide = yes
                $scope.focused = yes
                $scope.select({item:item})

            $scope.isVisible = () ->
                return !$scope.hide && ($scope.focused || $scope.mousedOver);


        link: (scope, element, attrs) ->
            $input = element.find('#alfred-input')

            scope.$watch $input, () =>
                do setFocus

            $input.bind 'keydown', (e) =>
                if e.keyCode is 40
                    e.preventDefault();
                    do activateNextItem

                if e.keyCode is 38
                    e.preventDefault();
                    do activatePreviousItem

            setFocus = () ->
                do $input.focus
                
            setActiveItem = (key) ->
                item = scope.connections[key]
                item.selected = yes

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



.directive 'connectionItem',  () ->
        restrict: 'A'

        link: (scope, element, attrs, controller) ->
            #console.log scope

            item = scope.$eval attrs.connectionItem
            key = scope.$eval(attrs.key)

            scope.$watch(
                () ->
                    if key is 0
                        element.addClass('active')
                (active) ->
                    if (active)
                        element.addClass('active')
                    else
                        element.removeClass('active')
            )

###
.directive "alfred", () ->
        restrict: "E"
        templateUrl: "partials/alfred.html"
        replace: yes
        transclude: yes
        scope:
            connections: "="

        controller: ($scope) ->
            $scope.connections = []
            $scope.hide = no

            @activate = (item) ->
                $scope.active = item

            this.activateNextItem = () ->
                index = $scope.connections.indexOf($scope.active);
                this.activate($scope.connections[(index + 1) % $scope.connections.length]);

            @activatePreviousItem = () ->
                index = $scope.items.indexOf($scope.active);
                this.activate($scope.connections[index is 0 ? $scope.connections.length - 1 : index - 1]);

            @isActive = (item) ->
                $scope.active is item

            @selectActive = () ->
                @select($scope.active)

            @select = (item) ->
                $scope.hide = yes
                $scope.focused = yes
                $scope.select({item:item})

            $scope.isVisible = () ->
                return !$scope.hide && ($scope.focused || $scope.mousedOver);
###
