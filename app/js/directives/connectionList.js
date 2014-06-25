(function() {
  'use strict';
  angular.module("alfredDirective", []).directive("connectionList", function() {
    return {
      restrict: "E",
      templateUrl: "partials/connectionList.html",
      replace: true,
      transclude: true,
      scope: {
        connections: "="
      },
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
      link: function(scope, element, attrs) {
        var $input, activateNextItem, activatePreviousItem, setActiveItem, setFocus;
        $input = element.find('#alfred-input');
        scope.$watch($input, (function(_this) {
          return function() {
            return setFocus();
          };
        })(this));
        $input.bind('keydown', (function(_this) {
          return function(e) {
            if (e.keyCode === 40) {
              e.preventDefault();
              activateNextItem();
            }
            if (e.keyCode === 38) {
              e.preventDefault();
              return activatePreviousItem();
            }
          };
        })(this));
        setFocus = function() {
          return $input.focus();
        };
        setActiveItem = function(key) {
          var item;
          item = scope.connections[key];
          return item.selected = true;
        };
        activateNextItem = function() {
          var current, next;
          current = element.find(".active");
          next = element.find(".active").next();
          if (next.length) {
            current.removeClass('active');
            return next.addClass('active');
          }
        };
        return activatePreviousItem = function() {
          var current, prev;
          current = element.find(".active");
          prev = element.find(".active").prev();
          if (prev.length) {
            current.removeClass('active');
            return prev.addClass('active');
          }
        };
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
      }
    };
  });


  /*
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
   */

}).call(this);
