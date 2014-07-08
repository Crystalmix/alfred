(function() {
  'use strict';

  /*
      connections         --  array of all hosts
      filteredConnections --  array of queried hosts
      subConnections      --  array of visible hosts
   */
  var alfredDirective;

  alfredDirective = angular.module("alfredDirective", []);

  alfredDirective.directive("alfred", function() {
    return {
      restrict: "E",
      templateUrl: "partials/alfred.html",
      replace: true,
      transclude: true,
      scope: {
        connections: "=",
        histories: "=",
        amount: "=",
        heightCell: "="
      },
      controller: function($scope) {
        $scope.selectedIndex = 0;
        $scope.setSelectedConnection = function(index) {
          return $scope.selectedIndex = index;
        };
        return this.setSelectedIndex = function(key) {
          $scope.setSelectedConnection(key);
          return $scope.$apply();
        };
      },
      link: function(scope, element) {
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
            scope.fromHistory = 0;
            return scope.selectedIndex = 0;
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
          if (scope.isTable) {
            if (event.keyCode === 37) {
              scope.isLeftActive = true;
              scope.isRightActive = false;
            }
            if (event.keyCode === 39) {
              scope.isLeftActive = false;
              scope.isRightActive = true;
            }
            if (event.keyCode === 38) {
              scope.$broadcast("arrow", "up");
            }
            if (event.keyCode === 40) {
              return scope.$broadcast("arrow", "down");
            }
          }
        };
      }
    };
  });

  alfredDirective.directive("inactiveList", function() {
    return {
      restrict: "AE",
      templateUrl: "partials/inactive-connections.html",
      scope: {
        connections: "=",
        amount: "=",
        heightCell: "=",
        from: "="
      },
      controller: function($scope) {
        $scope.setHeight = function() {
          return {
            height: $scope.heightCell + 'px'
          };
        };
        $scope.setHeightList = function() {
          return {
            height: $scope.amount * $scope.heightCell
          };
        };
        return $scope.initParameters = function() {
          return $scope.offset = $scope.from + $scope.amount;
        };
      },
      link: function(scope) {
        return scope.initParameters();
      }
    };
  });

  alfredDirective.directive("activeList", function() {
    return {
      require: "^alfred",
      restrict: "AE",
      templateUrl: "partials/active-connections.html",
      scope: {
        connections: "=",
        amount: "=",
        heightCell: "=",
        query: "=scopeQuery",
        from: "=",
        selectedIndex: "="
      },
      controller: function($scope) {
        $scope.setHeight = function() {
          return {
            height: $scope.heightCell + 'px'
          };
        };
        $scope.setHeightList = function() {
          return {
            height: $scope.amount * $scope.heightCell
          };
        };
        $scope.initParameters = function() {
          return $scope.offset = $scope.from + $scope.amount;
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
        scope.offset = scope.from + scope.amount;
        scope.$watch("selectedIndex", function(key) {
          return scope.$parent.$parent.selectedIndex = key;
        });
        scope.$on('arrow', function(event, orientation) {
          if (orientation === 'up') {
            return activatePreviousItem();
          } else {
            return activateNextItem();
          }
        });
        scope.$watch("from", function() {
          scope.offset = scope.from + scope.amount;
          console.log(scope.from);
          return console.log(scope.offset);
        });
        activateNextItem = function() {
          var current, currentIndex, next;
          current = element.find(".active");
          next = current.next();
          currentIndex = scope.getSelectedConnection();
          if (next.length === 0) {
            scope.loadDown();
            next = current.next();
            if (next.length !== 0) {
              return scope.setSelectedConnection(currentIndex);
            }
          } else {
            return scope.setSelectedConnection(++currentIndex);
          }
        };
        return activatePreviousItem = function() {
          var current, currentIndex, prev;
          current = element.find(".active");
          prev = current.prev();
          currentIndex = scope.getSelectedConnection();
          if (prev.length === 0) {
            scope.loadUp;
            prev = current.prev();
            if (prev.length !== 0) {
              return scope.setSelectedConnection(currentIndex);
            }
          } else {
            return scope.setSelectedConnection(--currentIndex);
          }
        };
      }
    };
  });

  alfredDirective.directive("connectionItem", function() {
    return {
      restrict: "A",
      require: "^activeList",
      link: function(scope, element, attrs, connectionListCtrl) {
        return element.bind("mouseenter", function() {
          return connectionListCtrl.select(scope.key);
        });
      }
    };
  });

  alfredDirective.filter("filterConnections", [
    "$filter", function($filter) {
      return function(input, scope, arg1, arg2) {
        var filterFilter;
        if (scope.prevquery !== scope.query) {
          scope.initParameters();
          scope.prevquery = scope.query;
        }
        filterFilter = $filter("filter");
        scope.filteredConnections = filterFilter(scope.connections, scope.query);
        console.log(arg1, arg2, scope.connections);
        return scope.filteredConnections.slice(arg1, arg2);
      };
    }
  ]);

}).call(this);
