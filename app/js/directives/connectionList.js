(function() {
  'use strict';

  /*
      connections         --  array of all hosts
      filteredConnections --  array of queried hosts
      subConnections      --  array of visible hosts
   */
  angular.module("alfredDirective", []).directive("connectionList", function() {
    return {
      restrict: "E",
      templateUrl: "partials/connectionList.html",
      replace: true,
      transclude: true,
      scope: {
        connections: "=",
        amount: "="
      },
      controller: function($scope) {
        $scope.select = function(connection, key) {
          $scope.setSelectedConnection(key);
          return console.log(connection);
        };
        $scope.setSelectedConnection = function(index) {
          return $scope.selectedIndex = index;
        };
        $scope.getSelectedConnection = function() {
          return $scope.selectedIndex;
        };
        $scope.initParameters = function() {
          $scope.from = 0;
          $scope.offset = $scope.amount;
          return $scope.selectedIndex = 0;
        };
        $scope.loadUp = function() {
          if ($scope.filteredConnections[$scope.from - 1]) {
            --$scope.from;
            return --$scope.offset;
          }
        };
        $scope.loadDown = function() {
          if ($scope.filteredConnections[$scope.offset]) {
            ++$scope.from;
            return ++$scope.offset;
          }
        };
        this.select = function(key) {
          $scope.setSelectedConnection(key);
          return $scope.$apply();
        };
        return $scope.initParameters();
      },
      link: function(scope, element, attrs) {
        var $input, activateNextItem, activatePreviousItem, setFocus;
        scope.prevquery = scope.query = null;
        $input = element.find('#alfred-input');
        setFocus = function() {
          return $input.focus();
        };
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
        activateNextItem = function() {
          var current, currentIndex, next;
          current = element.find(".active");
          next = current.next();
          currentIndex = scope.getSelectedConnection();
          if (next.length === 0) {
            scope.$apply(scope.loadDown);
            next = current.next();
            if (next.length !== 0) {
              return scope.$apply(scope.setSelectedConnection(currentIndex));
            }
          } else {
            return scope.$apply(scope.setSelectedConnection(++currentIndex));
          }
        };
        return activatePreviousItem = function() {
          var current, currentIndex, prev;
          current = element.find(".active");
          prev = current.prev();
          currentIndex = scope.getSelectedConnection();
          if (prev.length === 0) {
            scope.$apply(scope.loadUp);
            prev = current.prev();
            if (prev.length !== 0) {
              return scope.$apply(scope.setSelectedConnection(currentIndex));
            }
          } else {
            return scope.$apply(scope.setSelectedConnection(--currentIndex));
          }
        };
      }
    };
  }).directive("connectionItem", function() {
    return {
      restrict: "A",
      require: "^connectionList",
      link: function(scope, element, attrs, connectionListCtrl) {
        return element.bind("mouseenter", function() {
          return connectionListCtrl.select(scope.key);
        });
      }
    };
  }).filter("filterConnections", [
    "$filter", function($filter) {
      return function(input, scope, arg1, arg2) {
        var filterFilter;
        if (scope.prevquery !== scope.query) {
          scope.initParameters();
          scope.prevquery = scope.query;
        }
        filterFilter = $filter("filter");
        scope.filteredConnections = filterFilter(scope.connections, scope.query);
        return scope.filteredConnections.slice(arg1, arg2);
      };
    }
  ]);

}).call(this);
