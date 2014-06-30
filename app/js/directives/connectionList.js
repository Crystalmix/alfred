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
        $scope.selectedConnection = 0;
        $scope.select = function(connection, key) {
          $scope.setSelectedConnection(key);
          return console.log(connection);
        };
        $scope.setSelectedConnection = function(index) {
          return $scope.selectedConnection = index;
        };
        $scope.getSelectedConnection = function() {
          return $scope.selectedConnection;
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
        return scope.$watch($input, (function(_this) {
          return function() {
            return setFocus();
          };
        })(this));

        /*$input.bind 'keydown', (e) =>
            if e.keyCode is 40
                e.preventDefault();
                do activateNextItem
            if e.keyCode is 38
                e.preventDefault();
                do activatePreviousItem
         */
      }
    };
  }).directive("connectionItem", function() {
    return {
      restrict: "A",
      require: "^connectionList",
      link: function(scope, element, attrs, connectionListCtrl) {
        return element.bind('mouseleave', function() {});
      }
    };
  }).filter('filterConnections', [
    '$filter', function($filter) {
      return function(input, query, arg1, arg2) {
        var filterFilter;
        if (this.prevquery !== this.query) {
          this.initFromOffset();
          this.prevquery = this.query;
        }
        filterFilter = $filter('filter');
        this.filteredConnections = filterFilter(this.connections, query);
        return this.filteredConnections.slice(arg1, arg2);
      };
    }
  ]);

}).call(this);
