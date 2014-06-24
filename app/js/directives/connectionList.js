(function() {
  'use strict';
  angular.module('connectionDirective', []).directive('connectionList', function() {
    return {
      restrict: 'E',
      templateUrl: 'partials/connectionList.html',
      replace: true,
      transclude: true,
      controller: function($scope) {
        $scope.connections = [];
        $scope.hide = false;
        this.activate = function(item) {
          return $scope.active = item;
        };
        this.activateNextItem = function() {
          var index;
          index = $scope.connections.indexOf($scope.active);
          return this.activate($scope.connections[(index + 1) % $scope.connections.length]);
        };
        this.activatePreviousItem = function() {
          var index, _ref;
          index = $scope.items.indexOf($scope.active);
          return this.activate($scope.connections[(_ref = index === 0) != null ? _ref : $scope.connections.length - {
            1: index - 1
          }]);
        };
        this.isActive = function(item) {
          return $scope.active === item;
        };
        this.selectActive = function() {
          return this.select($scope.active);
        };
        this.select = function(item) {
          $scope.hide = true;
          $scope.focused = true;
          return $scope.select({
            item: item
          });
        };
        return $scope.isVisible = function() {
          return !$scope.hide && ($scope.focused || $scope.mousedOver);
        };
      },
      link: function(scope, element, attrs, controller) {
        var $input;
        $input = element.find('#alfred-input');
        return $input.bind('keydown', function(e) {
          if (e.keyCode === 40) {
            e.preventDefault();
            scope.$apply((function(_this) {
              return function() {
                return controller.activateNextItem();
              };
            })(this));
          }
          if (e.keyCode === 38) {
            e.preventDefault();
            return scope.$apply((function(_this) {
              return function() {
                return controller.activatePreviousItem();
              };
            })(this));
          }
        });
      }
    };
  }).directive('connectionItem', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs, controller) {
        var item, key;
        item = scope.$eval(attrs.connectionItem);
        key = scope.$eval(attrs.key);
        return scope.$watch(function() {
          if (key === 0) {
            return element.addClass('active');
          }
        }, function(active) {
          if (active) {
            return element.addClass('active');
          } else {
            return element.removeClass('active');
          }
        });

        /*element.bind('mouseenter', (e) =>
            scope.$apply(() ->
                controller.activate(item);
            );
        );
        
        element.bind('click', (e) =>
            scope.$apply(() ->
                 controller.select(item);
            );
        );
         */
      }
    };
  });

}).call(this);
