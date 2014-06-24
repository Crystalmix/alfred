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

        link: (scope, element, attrs, controller) ->
            console.log scope




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