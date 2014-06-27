(function() {
  'use strict';
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
        $scope.from = 0;
        $scope.offset = $scope.amount;
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
          if ($scope.connections[$scope.from - 1]) {
            --$scope.from;
            return --$scope.offset;
          }
        };
        $scope.loadDown = function() {
          if ($scope.connections[$scope.offset]) {
            ++$scope.from;
            return ++$scope.offset;
          }
        };
        return this.somethingDo = function() {
          return console.log('@somethingDo');
        };
      },
      link: function(scope, element, attrs) {
        var $input, activateNextItem, activatePreviousItem, createCounter, setFocus;
        $input = element.find('#alfred-input');
        setFocus = function() {
          return $input.focus();
        };
        activateNextItem = function() {
          var current, index, next;
          index = scope.getSelectedConnection() + 1;
          console.log(index);
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
        createCounter = function() {
          var i, _i, _ref, _results;
          scope.counter = [];
          _results = [];
          for (i = _i = 1, _ref = scope.amount; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
            _results.push(scope.counter.push(i));
          }
          return _results;
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
        return createCounter();
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
  }).filter('truncate', function() {
    return function(input, arg1, arg2) {
      return this.connections.slice(arg1, arg2);
    };
  });

}).call(this);
