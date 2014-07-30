(function() {
  'use strict';
  var alfredDirective;

  alfredDirective = angular.module("alfredDirective", ['cfp.hotkeys']);

  alfredDirective.config(function(hotkeysProvider) {

    /*
        'hotkeysProvider' is provider from angular.hotkeys.
    
        Switch default cheatsheet: hotkey '?'
     */
    return hotkeysProvider.includeCheatSheet = true;
  });


  /*
      A hepler service that can parse quick connect parameters
      Possible cases:
          ssh               user@host
          ssh               user@host   -p port
          ssh               user@host   -pport
  
          ssh    -p port    user@host
          ssh    -pport     user@host
   */

  alfredDirective.factory('quickConnectParse', function() {
    var trimArray;
    trimArray = function(array) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = array.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        array[i] = $.trim(array[i]);
      }
      return array;
    };
    return {

      /*
          Parses parameters
          @param input string that contains one of the possible cases
       */
      parse: function(input) {
        var inputArray, leftInputArray, options, rightInputArray;
        options = {};
        if (input.indexOf('ssh') !== -1) {
          inputArray = input.split('ssh');
          if (inputArray.length === 2 && inputArray[0] === "") {
            input = inputArray[1].trim();
            if (input && input.length > 2) {
              inputArray = _.compact(input.split("@"));
              if (inputArray.length === 2) {
                leftInputArray = inputArray[0].trim();
                rightInputArray = inputArray[1].trim();
                leftInputArray = trimArray(_.compact(leftInputArray.split(" ")));
                rightInputArray = trimArray(_.compact(rightInputArray.split(" ")));
                if (leftInputArray.length >= 2 && leftInputArray.indexOf('-p') !== -1) {
                  if (leftInputArray.length === 3 && leftInputArray[0] === "-p") {
                    options.port = parseInt(leftInputArray[1]);
                  } else if (leftInputArray.length === 2 && leftInputArray[0].indexOf('-p') === 0) {
                    options.port = parseInt(leftInputArray[0].slice(2));
                  } else {
                    return {};
                  }
                } else if (leftInputArray.length >= 2 && leftInputArray.indexOf('-p') === -1) {
                  return {};
                }
                options.ssh_username = leftInputArray[leftInputArray.length - 1];
                if (rightInputArray.length >= 2 && rightInputArray.indexOf("-p") !== -1) {
                  if (rightInputArray.length === 2 && rightInputArray[1].indexOf("-p") === 0) {
                    options.port = parseInt(rightInputArray[1].slice(2));
                  } else if (rightInputArray.length === 3 && rightInputArray[1] === "-p") {
                    options.port = parseInt(rightInputArray[2]);
                  } else {
                    return {};
                  }
                } else if (rightInputArray.length >= 2 && rightInputArray.indexOf("-p") === -1) {
                  return {};
                }
                options.hostname = rightInputArray[0];
                if (!options.port) {
                  options.port = 22;
                }
                return options;
              }
            }
          }
        }
        return {};
      }
    };
  });


  /*
      The alfred directive indicates input field, determines display table or list
   */

  alfredDirective.directive("alfred", [
    'hotkeys', 'quickConnectParse', function(hotkeys, quickConnectParse) {
      return {
        restrict: "E",
        replace: true,
        templateUrl: "src/templates/alfred.html",
        scope: {
          connections: "=",
          histories: "=",
          amount: "=",
          heightCell: "=",
          placeholder: "=",
          onEnterCallback: "&",
          onAddCallback: "&",
          onEditCallback: "&",
          onUploadCallback: "&",
          onRemoveCallback: "&"
        },
        controller: function($scope) {
          var bindHotkeysCmd, detectCtrlOrCmd;
          $scope.query = null;
          $scope.entities = $scope.connections.concat($scope.histories);
          $scope.selectedIndex = 0;
          $scope.setSelectedConnection = function(index) {
            $scope.selectedIndex = index;
            return $scope.$broadcast("setSelectedIndex", index);
          };
          hotkeys.bindTo($scope).add({
            combo: 'return',
            description: 'Make active left list',
            allowIn: ['INPUT'],
            callback: (function(_this) {
              return function() {
                var connection;
                if ($scope.query && $scope.query.indexOf("ssh") !== -1) {
                  connection = quickConnectParse.parse($scope.query);
                  return _this.enterCallback(connection);
                } else {
                  return $scope.$broadcast("enter");
                }
              };
            })(this)
          }).add({
            combo: 'left',
            description: 'Make active left list',
            allowIn: ['INPUT'],
            callback: function() {
              if ($scope.connections.length) {
                $scope.isLeftActive = true;
                return $scope.isRightActive = false;
              }
            }
          }).add({
            combo: 'right',
            description: 'Make active right list',
            allowIn: ['INPUT'],
            callback: function() {
              if ($scope.histories.length) {
                $scope.isLeftActive = false;
                return $scope.isRightActive = true;
              }
            }
          }).add({
            combo: 'up',
            description: 'Make active element above',
            allowIn: ['INPUT'],
            callback: function($event) {
              $event.preventDefault();
              return $scope.$broadcast("arrow", "up");
            }
          }).add({
            combo: 'down',
            description: 'Make active element above',
            allowIn: ['INPUT'],
            callback: function($event) {
              $event.preventDefault();
              return $scope.$broadcast("arrow", "down");
            }
          });
          bindHotkeysCmd = function() {
            var combo, i, _i, _ref, _results;
            _results = [];
            for (i = _i = 1, _ref = $scope.amount; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
              combo = "" + $scope.cmdSystemHotkey + "+" + i;
              _results.push(hotkeys.bindTo($scope).add({
                combo: combo,
                description: 'Make active element ' + (i + 1),
                allowIn: ['INPUT'],
                callback: function($event) {
                  $event.preventDefault();
                  $scope.setSelectedConnection(parseInt(String.fromCharCode($event.keyCode)) - 1);
                  return $scope.$broadcast("enter");
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

          /*
              Methods are api between alfred directive and child directives
           */
          this.setSelectedIndex = function(key) {
            return $scope.setSelectedConnection(key);
          };
          this.enterCallback = function(connection) {
            if (connection) {
              return $scope.onEnterCallback({
                connection: connection
              });
            }
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
          this.edit = function(connection) {
            if (connection) {
              return $scope.onEditCallback({
                connection: connection
              });
            }
          };
          this.upload = function(connection) {
            if (connection) {
              return $scope.onUploadCallback({
                connection: connection
              });
            }
          };
          this.remove = function(connection) {
            if (connection) {
              return $scope.onRemoveCallback({
                connection: connection
              });
            }
          };
          $scope.addConnection = function() {
            return $scope.onAddCallback();
          };
          $scope.cmdSystemHotkey = detectCtrlOrCmd();
          bindHotkeysCmd();
          return this;
        },
        link: function(scope, element, attrs) {
          var $input, checkQuery, initializeParameters, initializeTableParameters, makeRestLists;
          $input = element.find('#alfred-input');
          if (!angular.isDefined(attrs.onEnterCallback)) {
            scope.onEnterCallback = function(connection) {
              $input.trigger("onEnterCallback", connection.connection);
              return false;
            };
          }
          if (!angular.isDefined(attrs.onAddCallback)) {
            scope.onAddCallback = function() {
              $input.trigger("onAddCallback");
              return false;
            };
          }
          if (!angular.isDefined(attrs.onEditCallback)) {
            scope.onEditCallback = function(connection) {
              $input.trigger("onEditCallback", connection.connection);
              return false;
            };
          }
          if (!angular.isDefined(attrs.onUploadCallback)) {
            scope.onUploadCallback = function(connection) {
              $input.trigger("onUploadCallback", connection.connection);
              return false;
            };
          }
          if (!angular.isDefined(attrs.onRemoveCallback)) {
            scope.onRemoveCallback = function(connection) {
              $input.trigger("onRemoveCallback", connection.connection);
              return false;
            };
          }
          scope.$watch($input, (function(_this) {
            return function() {
              return $input.focus();
            };
          })(this));
          scope.$watch("isTable", function() {
            return initializeParameters();
          });
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
            scope.isLeftActive = scope.connections.length ? true : false;
            return scope.isRightActive = scope.connections.length ? false : true;
          };
          makeRestLists = function() {
            var maxLength, minLength;
            minLength = scope.connections.length < scope.histories.length ? scope.connections.length : scope.histories.length;
            if (minLength < scope.amount) {
              maxLength = scope.connections.length > scope.histories.length ? scope.connections.length : scope.histories.length;
              if (maxLength === 0) {

              } else if (maxLength < scope.amount) {
                if (scope.connections.length < scope.histories.length) {
                  scope.restOfConnections = new Array(maxLength - minLength);
                  return scope.restOfHistories = new Array(0);
                } else {
                  scope.restOfConnections = new Array(0);
                  return scope.restOfHistories = new Array(maxLength - minLength);
                }
              } else {
                if (scope.connections.length < scope.histories.length) {
                  scope.restOfConnections = new Array(scope.amount - minLength);
                  return scope.restOfHistories = new Array(0);
                } else {
                  scope.restOfConnections = new Array(0);
                  return scope.restOfHistories = new Array(scope.amount - minLength);
                }
              }
            }
          };
          scope.keydown = function() {
            return setTimeout((function() {
              checkQuery();
              if (scope.query && scope.query.indexOf("ssh") === 0) {
                return scope.$broadcast("quickConnect", scope.query);
              } else {
                return scope.$broadcast("quickConnect", null);
              }
            }), 0);
          };
          initializeParameters();
          initializeTableParameters();
          return makeRestLists();
        }
      };
    }
  ]);


  /*
      The inactiveList directive simply displays list
      It has only one event 'mouseenter' which changes active list
   */

  alfredDirective.directive("inactiveList", function() {
    return {
      require: "^alfred",
      restrict: "AE",
      templateUrl: "src/templates/inactive-connections.html",
      scope: {
        connections: "=",
        amount: "=",
        heightCell: "=",
        from: "=",
        rest: "="
      },
      controller: function($scope) {
        $scope.setHeight = function() {
          return {
            height: $scope.heightCell + 'px'
          };
        };
        $scope.setSizerHeight = function() {
          return {
            height: ($scope.from * 100) / $scope.connections.length + '%'
          };
        };
        $scope.setSliderHeight = function() {
          return {
            height: ($scope.amount * 100) / $scope.connections.length + '%'
          };
        };
        return $scope.changeOffset = function() {
          return $scope.offset = $scope.from + $scope.amount;
        };
      },
      link: function(scope, element, attrs, alfredCtrl) {
        var _normalizeSliderHeight;
        scope.changeOffset();
        element.bind("mouseenter", function() {
          if (scope.connections.length) {
            return alfredCtrl.changeActiveList();
          }
        });
        scope.changeSlider = function() {
          var sizer, sizes, slider;
          slider = (scope.amount * 100) / scope.filteredConnections.length;
          sizer = (scope.from * 100) / scope.filteredConnections.length;
          sizes = _normalizeSliderHeight(slider, sizer);
          scope.slider = sizes.sliderHeight;
          return scope.sizer = sizes.sizerHeight;
        };
        return _normalizeSliderHeight = function(sliderHeight, sizerHeight) {
          if (sizerHeight > 100 - sliderHeight) {
            sizerHeight = 100 - sliderHeight;
          }
          if (sliderHeight > 100) {
            sliderHeight = 100;
          }
          sliderHeight *= 100;
          sizerHeight *= 100;
          sizerHeight = Math.floor(sizerHeight) / 100;
          sliderHeight = Math.ceil(sliderHeight) / 100;
          return {
            sliderHeight: sliderHeight,
            sizerHeight: sizerHeight
          };
        };
      }
    };
  });


  /*
      The activeList directive displays active list with all hotkeys handlers
  
      connections         --  array of all json-objects
      filteredConnections --  array of queried json-objects
      subConnections      --  array of visible json-objects
   */

  alfredDirective.directive("activeList", function() {
    return {
      require: "^alfred",
      restrict: "AE",
      templateUrl: "src/templates/active-connections.html",
      scope: {
        connections: "=",
        amount: "=",
        heightCell: "=",
        query: "=",
        from: "=",
        selectedIndex: "=",
        cmdSystemHotkey: "=",
        rest: "="
      },
      controller: function($scope) {
        $scope.setHeight = function() {
          return {
            height: $scope.heightCell + 'px'
          };
        };
        $scope.setSizerHeight = function() {
          return {
            height: $scope.sizer + '%'
          };
        };
        $scope.setSliderHeight = function() {
          return {
            height: $scope.slider + '%'
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
        $scope.isHistory = function(connection) {
          if (connection.id != null) {
            return false;
          }
          return true;
        };
        this.select = function(key) {
          $scope.setSelectedConnection(key);
          return $scope.$apply();
        };
        $scope.changeOffset();
        return this;
      },
      link: function(scope, element, attrs, alfredCtrl) {
        var activateNextItem, activatePreviousItem, _normalizeSliderHeight;
        scope.selectedIndex = scope.selectedIndex >= scope.connections.length ? scope.connections.length - 1 : scope.selectedIndex;
        scope.alfredController = alfredCtrl;
        scope.prevquery = null;
        scope.enterText = '↩';
        scope.cmdSystemHotkey = scope.cmdSystemHotkey === "command" ? "⌘" : "Ctrl";
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
        scope.$on('quickConnect', function(event, params) {
          scope.quickConnectionsParams = params;
          return scope.$apply();
        });
        scope.edit = function($event, connection) {
          $event.preventDefault();
          $event.stopPropagation();
          return alfredCtrl.edit(connection);
        };
        scope.upload = function($event, connection) {
          $event.preventDefault();
          $event.stopPropagation();
          return alfredCtrl.edit(connection);
        };
        scope.remove = function($event, connection) {
          $event.preventDefault();
          $event.stopPropagation();
          return alfredCtrl.remove(connection);
        };
        scope.changeSlider = function() {
          var sizer, sizes, slider;
          slider = (scope.amount * 100) / scope.filteredConnections.length;
          sizer = (scope.from * 100) / scope.filteredConnections.length;
          sizes = _normalizeSliderHeight(slider, sizer);
          scope.slider = sizes.sliderHeight;
          return scope.sizer = sizes.sizerHeight;
        };
        _normalizeSliderHeight = function(sliderHeight, sizerHeight) {
          if (sizerHeight > 100 - sliderHeight) {
            sizerHeight = 100 - sliderHeight;
          }
          if (sliderHeight > 100) {
            sliderHeight = 100;
          }
          sliderHeight *= 100;
          sizerHeight *= 100;
          sizerHeight = Math.floor(sizerHeight) / 100;
          sliderHeight = Math.ceil(sliderHeight) / 100;
          return {
            sliderHeight: sliderHeight,
            sizerHeight: sizerHeight
          };
        };
        activateNextItem = function() {
          var currentIndex, next;
          currentIndex = scope.getSelectedConnection();
          next = scope.subConnections[currentIndex + 1];
          if (next == null) {
            scope.loadDown();
            return setTimeout((function() {
              var current;
              current = scope.subConnections[currentIndex];
              if (current === _.last(scope.filteredConnections)) {
                scope.from = 0;
                scope.offset = scope.amount;
                scope.setSelectedConnection(0);
                return scope.$apply();
              }
            }), 0);
          } else {
            return scope.setSelectedConnection(++currentIndex);
          }
        };
        return activatePreviousItem = function() {
          var currentIndex, prev;
          currentIndex = scope.getSelectedConnection();
          prev = scope.subConnections[currentIndex - 1];
          if (prev == null) {
            scope.loadUp();
            return setTimeout((function() {
              var current, from;
              current = scope.subConnections[currentIndex];
              if (current === scope.filteredConnections[0]) {
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
            }), 0);
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


  /*
      The whenScrolled directive displays active list with all hotkeys handlers
  
      connections         --  array of all json-objects
      filteredConnections --  array of queried json-objects
      subConnections      --  array of visible json-objects
   */

  alfredDirective.directive('whenScrolled', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        return element.bind('mousewheel', function(event) {
          if (event.originalEvent.wheelDelta < 0) {
            scope.$apply(scope.loadDown);
          } else {
            scope.$apply(scope.loadUp);
          }
          return event.preventDefault();
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
        scope.changeSlider();
        return scope.filteredConnections.slice(arg1, arg2);
      };
    }
  ]);

}).call(this);

angular.module('alfredDirective').run(['$templateCache', function ($templateCache) {
	$templateCache.put('src/templates/alfred.html', '<div class="alfred"> <input type="text" id="alfred-input" class="form-control input-lg input" ng-model="query" ng-keydown="keydown($event)" placeholder="{{placeholder}}"/> <div ng-if="connections.length || histories.length"> <div ng-if="isTable"> <div id="left" ng-class="{ active: isLeftActive }"> <div class="header"> <span>Hosts</span> <a type="button" ng-click="addConnection()"><span class="add glyphicon glyphicon-plus"></span></a> <i class="pull-right" ng-show="isLeftActive"> <a type="button"><span class="glyphicon glyphicon-arrow-left"></span></a> </i> </div> <div class="left-list" ng-if="isLeftActive"> <active-list connections="connections" amount="amount" height-cell="heightCell" query="query" from="fromConnection" selected-index="selectedIndex" rest="restOfConnections" cmd-system-hotkey="cmdSystemHotkey"> </active-list> </div> <div class="left-list" ng-if="isRightActive"> <inactive-list connections="connections" amount="amount" height-cell="heightCell" from="fromConnection" rest="restOfConnections"> </inactive-list> </div> </div> <div id="right" ng-class="{ active: isRightActive }"> <div class="header"> <span>History</span> <i class="pull-right" ng-show="isRightActive"> <a type="button"><span class="glyphicon glyphicon-arrow-right"></span></a> </i> </div> <div class="left-list" ng-if="isLeftActive"> <inactive-list connections="histories" amount="amount" height-cell="heightCell" from="fromHistory" rest="restOfHistories"> </inactive-list> </div> <div class="left-list" ng-if="isRightActive"> <active-list connections="histories" amount="amount" height-cell="heightCell" query="query" from="fromHistory" selected-index="selectedIndex" rest="restOfHistories" cmd-system-hotkey="cmdSystemHotkey"> </active-list> </div> </div> </div> <div ng-if="!isTable"> <div class="main-list"> <active-list connections="entities" amount="amount" height-cell="heightCell" query="query" from="fromConnection" selected-index="selectedIndex" cmd-system-hotkey="cmdSystemHotkey"> </active-list> </div> </div> </div> </div>');
	$templateCache.put('src/templates/active-connections.html', '<div id="fixed" when-scrolled="loadMore()"> <ul class="list-group"> <li ng-repeat="(key,connection) in subConnections=(connections | filterConnections:query:from:offset)" id="{{key}}" ng-click="select(connection, key)" connection-item="connection" key="{{key}}" ng-class="{ active: (key===selectedIndex) }" ng-style="setHeight()"> <span ng-if="connection.label"> {{connection.label}} <i class="active actions" ng-if="(key===selectedIndex)"> <div class="enter-block"> <i ng-if="!isHistory(connection)" class="glyphicon glyphicon-pencil" ng-click="edit($event, connection)"></i> <i ng-if="isHistory(connection)" class="glyphicon glyphicon-upload" ng-click="upload($event, connection)"></i> <i class="glyphicon glyphicon-trash" ng-click="remove($event, connection)"></i> </div> <i>{{enterText}}</i> </i> <i ng-if="!(key===selectedIndex)">{{cmdSystemHotkey}}{{key+1}}</i> </span> <span ng-if="!connection.label"> {{connection.ssh_username}}@{{connection.hostname}} <i class="active actions" ng-if="(key===selectedIndex)"> <div class="enter-block"> <i ng-if="!isHistory(connection)" class="glyphicon glyphicon-pencil" ng-click="edit($event, connection)"></i> <i ng-if="isHistory(connection)" class="glyphicon glyphicon-upload" ng-click="upload($event, connection)"></i> <i class="glyphicon glyphicon-trash" ng-click="remove($event, connection)"></i> </div> <i>{{enterText}}</i> </i> <i ng-if="!(key===selectedIndex)">{{cmdSystemHotkey}}{{key+1}}</i> </span> </li> <li ng-repeat="i in rest track by $index" ng-style="setHeight()" class="empty-cell"> </li> <li ng-if="quickConnectionsParams" ng-bind="quickConnectionsParams"></li> <li ng-if="!subConnections.length && !quickConnectionsParams">Nothing</li> </ul> </div> <div class="scroller" ng-if="filteredConnections.length> amount"> <div class="sizer" ng-style="setSizerHeight()"></div> <div class="slider" ng-style="setSliderHeight()"></div> </div>');
	$templateCache.put('src/templates/inactive-connections.html', '<div id="inactive-list"> <ul class="list-group"> <li ng-repeat="(key,connection) in connections | filterConnections:null:from:offset" ng-style="setHeight()"> <span ng-if="connection.label"> {{connection.label}} </span> <span ng-if="!connection.label"> {{connection.ssh_username}}@{{connection.hostname}} </span> </li> <li ng-repeat="i in rest track by $index" ng-style="setHeight()" class="empty-cell"> </li> </ul> </div> <div class="scroller" ng-if="connections.length> amount"> <div class="sizer" ng-style="setSizerHeight()"></div> <div class="slider" ng-style="setSliderHeight()"></div> </div>');
}]);