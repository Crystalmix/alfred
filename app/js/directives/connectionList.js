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
        $scope.selectedConnection = 0;
        $scope.select = function(connection, key) {
          $scope.setSelectedConnection(key);
          return console.log(connection);
        };
        $scope.setSelectedConnection = function(index) {
          return $scope.selectedConnection = index;
        };
        return $scope.getSelectedConnection = function() {
          return $scope.selectedConnection;
        };
      },
      link: function(scope, element, attrs) {
        var $input, activateNextItem, activatePreviousItem, setFocus;
        $input = element.find('#alfred-input');
        setFocus = function() {
          return $input.focus();
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
        activatePreviousItem = function() {
          var current, prev;
          current = element.find(".active");
          prev = element.find(".active").prev();
          if (prev.length) {
            current.removeClass('active');
            return prev.addClass('active');
          }
        };
        scope.$watch($input, (function(_this) {
          return function() {
            return setFocus();
          };
        })(this));
        return $input.bind('keydown', (function(_this) {
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
      }
    };
  });

}).call(this);
