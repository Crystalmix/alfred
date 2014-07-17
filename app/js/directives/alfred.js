(function() {
  'use strict';
  var alfredDirective;

  alfredDirective = angular.module("alfredDirective", ['cfp.hotkeys']);

  alfredDirective.directive("alfred", function(hotkeys) {
    return {
      restrict: "E",
      templateUrl: "partials/alfred.html",
      replace: true,
      transclude: true,
      scope: {
        connections: "=",
        histories: "=",
        amount: "=",
        heightCell: "=",
        onEnterCallback: "&",
        placeholder: "="
      },
      controller: function($scope) {
        $scope.query = null;
        $scope.entities = $scope.connections.concat($scope.histories);
        $scope.selectedIndex = 0;
        $scope.setSelectedConnection = function(index) {
          $scope.selectedIndex = index;
          return $scope.$broadcast("setSelectedIndex", index);
        };
        this.setSelectedIndex = function(key) {
          return $scope.setSelectedConnection(key);
        };
        this.enterCallback = function(connection) {
          return $scope.onEnterCallback({
            connection: connection
          });
        };
        this.changeFromProperty = function(from) {
          if ($scope.isTable) {
            if ($scope.isLeftActive) {
              return $scope.fromConnection = from;
            } else {
              return $scope.fromHistory = from;
            }
          }
        };
        this.changeActiveList = function() {
          if ($scope.isLeftActive) {
            $scope.isLeftActive = false;
            $scope.isRightActive = true;
          } else {
            $scope.isLeftActive = true;
            $scope.isRightActive = false;
          }
          return $scope.$apply();
        };
        return this;
      },
      link: function(scope, element, attrs) {
        var $input, bindHotkeysCmd, checkQuery, detectCtrlOrCmd, initializeParameters, initializeTableParameters;
        $input = element.find('#alfred-input');
        scope.$watch($input, (function(_this) {
          return function() {
            return $input.focus();
          };
        })(this));
        scope.$watch("isTable", function() {
          return initializeParameters();
        });
        hotkeys.bindTo(scope).add({
          combo: 'return',
          description: 'Make active left list',
          allowIn: ['INPUT'],
          callback: function($event) {
            $event.preventDefault();
            return scope.$broadcast("enter");
          }
        }).add({
          combo: 'left',
          description: 'Make active left list',
          allowIn: ['INPUT'],
          callback: function($event) {
            $event.preventDefault();
            scope.isLeftActive = true;
            return scope.isRightActive = false;
          }
        }).add({
          combo: 'right',
          description: 'Make active right list',
          allowIn: ['INPUT'],
          callback: function($event) {
            $event.preventDefault();
            scope.isLeftActive = false;
            return scope.isRightActive = true;
          }
        }).add({
          combo: 'up',
          description: 'Make active element above',
          allowIn: ['INPUT'],
          callback: function($event) {
            $event.preventDefault();
            return scope.$broadcast("arrow", "up");
          }
        }).add({
          combo: 'down',
          description: 'Make active element above',
          allowIn: ['INPUT'],
          callback: function($event) {
            $event.preventDefault();
            return scope.$broadcast("arrow", "down");
          }
        });
        bindHotkeysCmd = function() {
          var combo, i, _i, _ref, _results;
          _results = [];
          for (i = _i = 1, _ref = scope.amount; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
            combo = "" + scope.cmdSystemHotkey + "+" + i;
            _results.push(hotkeys.bindTo(scope).add({
              combo: combo,
              description: 'Cmd+i',
              allowIn: ['INPUT'],
              callback: function($event) {
                $event.preventDefault();
                scope.setSelectedConnection(parseInt(String.fromCharCode($event.keyCode)) - 1);
                return scope.$broadcast("enter");
              }
            }));
          }
          return _results;
        };
        detectCtrlOrCmd = function() {
          var hotKey, isMac;
          isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
          hotKey = isMac ? 'command' : 'ctrl';
          return hotKey;
        };
        checkQuery = function() {
          if (scope.query) {
            scope.isTable = false;
          } else {
            scope.isTable = true;
          }
          return scope.$apply();
        };
        initializeParameters = function() {
          scope.fromConnection = 0;
          scope.fromHistory = 0;
          return scope.selectedIndex = 0;
        };
        initializeTableParameters = function() {
          scope.isTable = true;
          scope.isLeftActive = true;
          return scope.isRightActive = false;
        };
        scope.keydown = function($event) {
          return setTimeout((function() {
            return checkQuery();
          }), 0);
        };
        scope.cmdSystemHotkey = detectCtrlOrCmd();
        initializeParameters();
        initializeTableParameters();
        return bindHotkeysCmd();
      }
    };
  });

  alfredDirective.directive("inactiveList", function() {
    return {
      require: "^alfred",
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
        return $scope.changeOffset = function() {
          return $scope.offset = $scope.from + $scope.amount;
        };
      },
      link: function(scope, element, attrs, alfredCtrl) {
        scope.changeOffset();
        return element.bind("mouseenter", function() {
          return alfredCtrl.changeActiveList();
        });
      }
    };
  });

  alfredDirective.directive("activeList", function() {
    return {

      /*
          connections         --  array of all hosts
          filteredConnections --  array of queried hosts
          subConnections      --  array of visible hosts
       */
      require: "^alfred",
      restrict: "AE",
      templateUrl: "partials/active-connections.html",
      scope: {
        connections: "=",
        amount: "=",
        heightCell: "=",
        query: "=",
        from: "=",
        selectedIndex: "=",
        cmdSystemHotkey: "="
      },
      controller: function($scope) {
        $scope.setHeight = function() {
          return {
            height: $scope.heightCell + 'px'
          };
        };
        $scope.changeOffset = function() {
          return $scope.offset = $scope.from + $scope.amount;
        };
        $scope.initializeParameteres = function() {
          $scope.from = 0;
          return $scope.setSelectedConnection(0);
        };
        $scope.select = function(connection, key) {
          $scope.setSelectedConnection(key);
          return $scope.alfredController.enterCallback(connection);
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
        $scope.changeOffset();
        return this;
      },
      link: function(scope, element, attrs, alfredCtrl) {
        var activateNextItem, activatePreviousItem;
        scope.alfredController = alfredCtrl;
        scope.prevquery = null;
        scope.enterText = '↩';
        scope.cmdSystemHotkey = scope.cmdSystemHotkey === "command" ? "Cmd" : "Ctrl";
        scope.$watch("selectedIndex", function(key) {
          return alfredCtrl.setSelectedIndex(key);
        });
        scope.$watch("from", function(from) {
          scope.offset = scope.from + scope.amount;
          return alfredCtrl.changeFromProperty(from);
        });
        scope.$on('arrow', function(event, orientation) {
          if (orientation === 'up') {
            return activatePreviousItem();
          } else {
            return activateNextItem();
          }
        });
        scope.$on('setSelectedIndex', function(event, key) {
          return scope.selectedIndex = key;
        });
        scope.$on('enter', function() {
          var connection, key;
          key = scope.getSelectedConnection();
          connection = scope.subConnections[key];
          return scope.select(connection, key);
        });
        activateNextItem = function() {
          var current, currentIndex, next;
          current = element.find(".active");
          next = current.next();
          currentIndex = scope.getSelectedConnection();
          if (next.length === 0) {
            scope.loadDown();
            return setTimeout((function() {
              next = current.next();
              if (next.length === 0) {
                scope.from = 0;
                scope.offset = scope.amount;
                scope.setSelectedConnection(0);
                return scope.$apply();
              }
            }), 100);
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
            scope.loadUp();
            return setTimeout((function() {
              var from;
              prev = current.prev();
              if (prev.length === 0) {
                from = scope.filteredConnections.length - scope.amount;
                if (from > 0) {
                  scope.from = from;
                  scope.offset = scope.filteredConnections.length - 1;
                  scope.setSelectedConnection(scope.amount - 1);
                } else {
                  scope.setSelectedConnection(scope.filteredConnections.length - 1);
                }
                return scope.$apply();
              }
            }), 100);
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
      return function(input, query, arg1, arg2) {
        var filterFilter, scope;
        scope = this;
        if (scope.prevquery !== scope.query && scope.query !== "") {
          scope.initializeParameteres();
          scope.prevquery = scope.query;
        }
        filterFilter = $filter("filter");
        scope.filteredConnections = filterFilter(scope.connections, scope.query);
        return scope.filteredConnections.slice(arg1, arg2);
      };
    }
  ]);

}).call(this);
