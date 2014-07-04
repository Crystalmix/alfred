(function() {
  'use strict';

  /*
      connections         --  array of all hosts
      filteredConnections --  array of queried hosts
      subConnections      --  array of visible hosts
   */
  angular.module("alfredDirective", []).directive("alfred", function() {
    return {
      restrict: "E",
      templateUrl: "partials/alfred.html",
      replace: true,
      transclude: true,
      scope: {
        connections: "=",
        histories: "=",
        amount: "=",
        widthCell: "="
      },
      controller: function($scope) {
        return this.changeFrom = function(index) {
          return $scope.fromConnection = index;
        };
      },
      link: function(scope, element, attrs) {
        var $input, checkQuery, setFocus;
        $input = element.find('#alfred-input');
        setFocus = function() {
          return $input.focus();
        };
        scope.$watch($input, (function(_this) {
          return function() {
            return setFocus();
          };
        })(this));
        scope.$watch("isTable", function() {
          if (scope.isTable) {
            scope.fromConnection = 0;
            return scope.fromHistory = 0;
          }
        });
        scope.isTable = true;
        scope.isLeftActive = true;
        scope.isRightActive = false;
        checkQuery = function() {
          if (scope.query) {
            scope.isTable = false;
            return scope.$apply();
          } else {
            scope.isTable = true;
            return scope.$apply();
          }
        };
        return scope.keydown = function(event) {
          setTimeout((function() {
            return checkQuery();
          }), 0);
          if (event.keyCode === 37 || event.keyCode === 39) {
            scope.isLeftActive = true;
            scope.isRightActive = false;
          }
          if (event.keyCode === 39) {
            scope.isLeftActive = false;
            return scope.isRightActive = true;
          }
        };
      }
    };
  }).directive("connectionListNotActive", function() {
    return {
      restrict: "AE",
      templateUrl: "partials/connections-not-active.html",
      scope: {
        connections: "=",
        amount: "=",
        widthCell: "=",
        from: "="
      },
      controller: function($scope) {
        $scope.setHeight = function() {
          return {
            height: $scope.widthCell + 'px'
          };
        };
        $scope.setHeightList = function() {
          return {
            height: $scope.amount * $scope.widthCell
          };
        };
        return $scope.initParameters = function() {
          $scope.from = $scope.from;
          $scope.offset = $scope.from + $scope.amount;
          return $scope.selectedIndex = 0;
        };
      },
      link: function(scope, element, attrs) {
        return scope.initParameters();
      }
    };
  }).directive("connectionList", function() {
    return {
      restrict: "AE",
      require: "^alfred",
      templateUrl: "partials/connections.html",
      scope: {
        connections: "=",
        amount: "=",
        widthCell: "=",
        query: "=scopeQuery",
        from: "="
      },
      controller: function($scope) {
        $scope.setHeight = function() {
          return {
            height: $scope.widthCell + 'px'
          };
        };
        $scope.setHeightList = function() {
          return {
            height: $scope.amount * $scope.widthCell
          };
        };
        $scope.initParameters = function() {
          $scope.from = $scope.from;
          $scope.offset = $scope.from + $scope.amount;
          return $scope.selectedIndex = 0;
        };
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
        this.select = function(key) {
          $scope.setSelectedConnection(key);
          return $scope.$apply();
        };
        return $scope.initParameters();
      },
      link: function(scope, element, attrs, alfredCtrl) {
        var activateNextItem, activatePreviousItem;
        scope.prevquery = scope.query = null;

        /*scope.$watch "from", () ->
            if scope.from isnt 0
                if scope.$parent.$parent.isRightActive
                    ++ scope.$parent.$parent.fromHistory
                    scope.$apply()
                if scope.$parent.$parent.isLeftActive
                    ++ scope.$parent.$parent.fromConnectoins
                    scope.$apply()
         */

        /*$input.bind 'keydown', (e) =>
            if e.keyCode is 40
                e.preventDefault();
                do activateNextItem
            if e.keyCode is 38
                e.preventDefault();
                do activatePreviousItem
         */
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
