'use strict';
#
# connections = connections
# histories = histories
#

angular.module('connectionDirective', [])

.directive 'connectionList',  () ->
        restrict: 'E'
        templateUrl: 'partials/connectionList.html'
        replace: yes
        transclude: yes

        controller: ($scope) ->
            $scope.connections = []
            $scope.hide = no

            @activate = (item) ->
                $scope.active = item

            @activateNextItem = () ->
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



        link: (scope, element, attrs, controller) ->
            $input = element.find('#alfred-input')

            $input.bind 'keydown', (e) ->
                if e.keyCode is 40
                    e.preventDefault();
                    scope.$apply(() =>
                        do controller.activateNextItem
                    )
                if e.keyCode is 38
                    e.preventDefault();
                    scope.$apply(() =>
                        do controller.activatePreviousItem
                    )




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

            ###element.bind('mouseenter', (e) =>
                scope.$apply(() ->
                    controller.activate(item);
                );
            );

            element.bind('click', (e) =>
                scope.$apply(() ->
                     controller.select(item);
                );
            );###