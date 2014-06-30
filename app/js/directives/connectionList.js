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
        $scope.selectedIndex = 0;
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
        this.somethingDo = function() {
          return console.log('@somethingDo');
        };
        $scope.initFromOffset = function() {
          $scope.from = 0;
          return $scope.offset = $scope.amount;
        };
        return $scope.initFromOffset();
      },
      link: function(scope, element, attrs) {
        var $input, activateNextItem, activatePreviousItem, setFocus;
        scope.prevquery = scope.query = null;
        $input = element.find('#alfred-input');
        setFocus = function() {
          return $input.focus();
        };
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
        return element.bind("mouseleave", function() {});
      }
    };
  }).filter("filterConnections", [
    "$filter", function($filter) {
      return function(input, query, arg1, arg2) {
        var filterFilter;
        if (this.prevquery !== this.query) {
          this.initFromOffset();
          this.prevquery = this.query;
        }
        filterFilter = $filter("filter");
        this.filteredConnections = filterFilter(this.connections, query);
        return this.filteredConnections.slice(arg1, arg2);
      };
    }
  ]);

}).call(this);
