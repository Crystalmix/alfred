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
        $scope.counter = 0;
        $scope.subConnections = $scope.connections.slice($scope.counter, $scope.amount);
        $scope.counter += $scope.amount;
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

        /*$scope.loadMore = (params) ->
            console.log $scope.subConnections
            if $scope.counter < $scope.connections.length
                $scope.subConnections = $scope.subConnections.slice(0)
                $scope.subConnections.push($scope.connections[$scope.counter])
                $scope.counter += 1;
         */
        $scope.loadUp = function() {
          return console.log(true);
        };
        $scope.loadDown = function() {
          if ($scope.counter < $scope.connections.length) {
            $scope.subConnections.shift();
            $scope.subConnections.push($scope.connections[$scope.counter]);
            return $scope.counter += 1;
          }
        };
        return this.somethingDo = function() {
          return console.log('@somethingDo');
        };
      },
      link: function(scope, element, attrs) {
        var $input, activateNextItem, activatePreviousItem, setFocus;
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
  }).directive("connectionItem", function() {
    return {
      restrict: "A",
      require: "^connectionList",
      link: function(scope, element, attrs, connectionListCtrl) {
        return element.bind('mouseleave', function() {});
      }
    };
  });

}).call(this);
