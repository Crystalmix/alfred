(function() {
  'use strict';
  var alfredDirective;

  alfredDirective = angular.module("alfredDirective", ["ng-context-menu"]);


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
    return {

      /*
          Parses parameters
          @param input string that contains one of the possible cases
       */
      parse: function(input) {
        var ARGS, cmd, options, parser, query;
        options = {};
        cmd = null;
        ARGS = [['-p', '--port [NUMBER]', 'Port to connect to on the remote host.']];
        parser = new optparse.OptionParser(ARGS);
        parser.on('port', function(name, value) {
          return options.port = value;
        });
        parser.on(0, function(value) {
          return cmd = value;
        });
        parser.on(1, function(value) {
          value = value.split('@');
          if (value.length === 2) {
            options.ssh_username = value[0];
            return options.hostname = value[1];
          }
        });
        parser.on(2, function(value) {
          return options.other_args = value;
        });
        query = input.replace(/\s+@/g, '@').replace(/@\s+/g, '@').split(/\s+/);
        parser.parse(query);
        if (cmd === 'ssh') {
          if (!options.ssh_username || !options.hostname || (options.other_args != null)) {
            return {};
          }
          if (options.port == null) {
            options.port = 22;
          }
          return options;
        }
        return {};
      }
    };
  });


  /*
      The alfred directive indicates input field, determines display table or list
   */

  alfredDirective.directive("alfred", [
    "quickConnectParse", "$timeout", function(quickConnectParse, $timeout) {
      return {
        restrict: "E",
        replace: true,
        templateUrl: "src/templates/alfred.html",
        scope: {
          uid: "=",
          hosts: "=",
          histories: "=",
          groups: "=",
          taghosts: "=",
          tags: "=",
          amount: "=",
          heightCell: "=",
          placeholder: "=",
          template: "=",
          onEnterCallback: "&",
          onAddCallback: "&",
          onEditCallback: "&",
          onUploadCallback: "&",
          onRemoveCallback: "&"
        },
        controller: function($scope, $element) {
          var bindHotkeysCmd, detectCtrlOrCmd, filter_hosts_by_chosen_tags, getConnections, getGroups, transformationData;
          $scope.query = null;
          $scope.selectedIndex = 0;
          $scope.current_group = null;
          getGroups = function() {
            $scope.path_groups = $scope.current_group ? $scope.groups.get_parent_groups($scope.current_group.get('local_id')) : [];
            $scope.path_groups.reverse();
            $scope.children_group = $scope.current_group ? _.rest($scope.groups.get_all_children($scope.current_group.get('local_id'))) : $scope.groups.get_root();
            _.each($scope.children_group, function(val, key) {
              return $scope.children_group[key] = _.clone(val.toJSON({
                do_not_encrypt: false
              }));
            });
            return _.each($scope.path_groups, function(val, key) {
              return $scope.path_groups[key] = _.clone(val.toJSON({
                do_not_encrypt: false
              }));
            });
          };
          filter_hosts_by_chosen_tags = function() {
            var id_of_hosts, tag_hosts;
            tag_hosts = [];
            id_of_hosts = [];
            _.each($scope.chosen_tags, function(val) {
              return tag_hosts = _.union(tag_hosts, $scope.taghosts.find_by_tag(val.get("local_id")));
            });
            tag_hosts = _.uniq(tag_hosts);
            _.each(tag_hosts, function(val) {
              if (val.get(host).local_id) {
                return id_of_hosts = _.union(id_of_hosts, val.get(host).local_id);
              } else if (val.get(host).id) {
                return id_of_hosts = _.union(id_of_hosts, val.get(host).id);
              }
            });
            return $scope.connections = _.filter($scope.connections, function(val) {
              if (_.contains(tag_hosts, val.get("local_id"))) {
                return val;
              }
            });
          };
          getConnections = function() {
            $scope.connections = _.clone($scope.hosts.models);
            if ($scope.current_group) {
              $scope.connections = $scope.hosts.filter_by_group($scope.current_group.get('local_id'));
            }
            return _.each($scope.connections, function(val, key) {
              val.set({
                username: val.get_ssh_identity().get("username")
              });
              val.set({
                password: val.get_ssh_identity().get("password")
              });
              val.set({
                key: val.get_ssh_identity().get("key")
              });
              return $scope.connections[key] = val.toJSON({
                do_not_encrypt: false
              });
            });
          };
          transformationData = function() {
            $scope.copy_taghosts = $scope.taghosts.toJSON();
            $scope.tags = $scope.taghosts.toJSON();
            getGroups();
            getConnections();
            return $scope.chosen_tags = [];
          };
          $scope.filterByGroup = function(local_id) {
            $scope.current_group = local_id ? $scope.groups.get(local_id) : null;
            return $timeout((function() {
              return transformationData();
            }));
          };
          $scope.setSelectedConnection = function(index) {
            $scope.selectedIndex = index;
            return $scope.$broadcast("setSelectedIndex", index);
          };
          $scope.changeActiveList = function() {
            if ($scope.connections.length && $scope.histories.length) {
              $scope.isLeftActive = !$scope.isLeftActive;
              $scope.isRightActive = !$scope.isRightActive;
            }
            return false;
          };
          $scope.isCheckTag = function(tag) {
            return _.contains($scope.chosen_tags, tag);
          };
          $scope.selectTag = function(tag) {
            if (_.contains($scope.chosen_tags, tag)) {
              return $scope.chosen_tags = _.without($scope.chosen_tags, tag);
            } else {
              return $scope.chosen_tags = _.union($scope.chosen_tags, tag);
            }
          };
          jwerty.key('→', (function() {
            if ($scope.scope.is_interrupt_arrow_commands === false && $scope.histories.length) {
              $scope.isLeftActive = false;
              return $scope.isRightActive = true;
            } else if ($scope.scope.is_interrupt_arrow_commands === true) {
              return true;
            }
          }), $element);
          jwerty.key('←', (function() {
            if ($scope.scope.is_interrupt_arrow_commands === false && $scope.connections.length) {
              $scope.isLeftActive = true;
              return $scope.isRightActive = false;
            } else if ($scope.scope.is_interrupt_arrow_commands === true) {
              return true;
            }
          }), $element);
          jwerty.key('⇥', (function() {
            if ($scope.scope.is_interrupt_arrow_commands === false && $scope.connections.length && $scope.histories.length) {
              $scope.isLeftActive = !$scope.isLeftActive;
              $scope.isRightActive = !$scope.isRightActive;
            }
            return false;
          }), $element);
          jwerty.key('↑', (function() {
            $scope.$broadcast("arrow", "up");
            return false;
          }), $element);
          jwerty.key('↓', (function() {
            $scope.$broadcast("arrow", "down");
            return false;
          }), $element);
          jwerty.key('↩', ((function(_this) {
            return function() {
              var connection;
              if ($scope.query && $scope.query.indexOf("ssh") !== -1) {
                connection = quickConnectParse.parse($scope.query);
                return _this.enterCallback(connection);
              } else {
                return $scope.$broadcast("enter");
              }
            };
          })(this)), $element);
          bindHotkeysCmd = function() {
            var hotkey, i, _i, _ref, _results;
            hotkey = detectCtrlOrCmd();
            _results = [];
            for (i = _i = 1, _ref = $scope.amount; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
              _results.push(jwerty.key("" + hotkey + "+" + i, (function($event) {
                $scope.$broadcast("enter", parseInt(String.fromCharCode($event.keyCode), 10) - 1);
                return false;
              }), $element));
            }
            return _results;
          };
          detectCtrlOrCmd = function() {
            var hotKey, isMac;
            isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
            hotKey = isMac ? "⌘" : "ctrl";
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
            if ($scope.isLeftActive) {
              return $scope.fromConnection = from;
            } else {
              return $scope.fromHistory = from;
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
          this.addConnection = function() {
            return $scope.onAddCallback();
          };
          $scope.cmdSystemHotkey = detectCtrlOrCmd();
          bindHotkeysCmd();
          transformationData();
          return this;
        },
        link: function(scope, element, attrs) {
          var $input, checkQuery, initializeParameters, initializeTableParameters;
          $input = element.find('#alfred-input');
          scope.is_interrupt_arrow_commands = false;
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
          scope.$on("setFocus", function(event, uid) {
            if (uid === scope.uid) {
              return $timeout(scope.setFocusAtInput);
            }
          });
          scope.setFocusAtInput = function() {
            $input.focus();
            return false;
          };
          scope.$watch($input, (function(_this) {
            return function() {
              return $timeout((function() {
                return scope.setFocusAtInput();
              }), 200);
            };
          })(this));
          checkQuery = function() {
            if (scope.query) {
              scope.is_interrupt_arrow_commands = true;
            } else {
              scope.is_interrupt_arrow_commands = false;
            }
            return scope.$apply();
          };
          initializeParameters = function() {
            scope.fromConnection = 0;
            scope.fromHistory = 0;
            return scope.selectedIndex = 0;
          };
          initializeTableParameters = function() {
            scope.isLeftActive = scope.connections.length ? true : false;
            return scope.isRightActive = scope.connections.length ? false : true;
          };
          scope.keydown = function(event) {
            return $timeout((function() {
              checkQuery();
              if (scope.query && scope.query.indexOf("ssh") === 0) {
                return scope.$broadcast("quickConnect", scope.query);
              } else {
                return scope.$broadcast("quickConnect", null);
              }
            }), 50);
          };
          initializeParameters();
          return initializeTableParameters();
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
        $scope.select = function($event, connection, key) {
          $event.preventDefault();
          $event.stopPropagation();
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
          if (connection.is_history) {
            return true;
          }
          return false;
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
        scope.cmdSystemHotkey = scope.cmdSystemHotkey === "⌘" ? "⌘" : "Ctrl";
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
        scope.$on('enter', function(event, key) {
          var connection;
          if (key == null) {
            key = scope.getSelectedConnection();
          }
          if (scope.subConnections[key] != null) {
            scope.setSelectedConnection(key);
            connection = scope.subConnections[key];
            return scope.select(connection, key);
          }
        });
        scope.$on('quickConnect', function(event, params) {
          scope.quickConnectionsParams = params;
          return scope.$apply();
        });
        scope.addConnection = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          return alfredCtrl.addConnection();
        };
        scope.edit = function($event, connection) {
          $event.preventDefault();
          $event.stopPropagation();
          return alfredCtrl.edit(connection);
        };
        scope.upload = function($event, connection) {
          $event.preventDefault();
          $event.stopPropagation();
          return alfredCtrl.upload(connection);
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
            if (_.isEqual(_.last(scope.subConnections), _.last(scope.filteredConnections))) {
              scope.from = 0;
              scope.offset = scope.amount;
              return scope.setSelectedConnection(0);
            } else {
              return scope.loadDown();
            }
          } else {
            return scope.setSelectedConnection(++currentIndex);
          }
        };
        return activatePreviousItem = function() {
          var currentIndex, from, prev;
          currentIndex = scope.getSelectedConnection();
          prev = scope.subConnections[currentIndex - 1];
          if (prev == null) {
            if (_.isEqual(_.first(scope.subConnections), _.first(scope.filteredConnections))) {
              from = scope.filteredConnections.length - scope.amount;
              if (from > 0) {
                scope.from = from;
                scope.offset = scope.filteredConnections.length - 1;
                return scope.setSelectedConnection(scope.amount - 1);
              } else {
                return scope.setSelectedConnection(scope.filteredConnections.length - 1);
              }
            } else {
              return scope.loadUp();
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
      return function(input, query, arg1, arg2, context) {
        var filterFilter, scope;
        scope = context;
        if (scope.prevquery !== scope.query && scope.query !== "") {
          scope.initializeParameteres();
          scope.prevquery = scope.query;
        }
        filterFilter = $filter("filter");
        scope.filteredConnections = filterFilter(scope.connections, function(value, index) {
          var isMatchHostname, isMatchLabel, isMatchUsername;
          if (!scope.query) {
            return value;
          } else {
            isMatchLabel = function(value) {
              if (value.label) {
                return value.label.indexOf(scope.query) !== -1;
              }
              return false;
            };
            isMatchHostname = function(value) {
              if (value.hostname) {
                return value.hostname.indexOf(scope.query) !== -1;
              }
              return false;
            };
            isMatchUsername = function(value) {
              if (value.ssh_username) {
                return value.ssh_username.indexOf(scope.query) !== -1;
              }
              return false;
            };
            return isMatchLabel(value) || isMatchHostname(value) || isMatchUsername(value);
          }
        });
        scope.changeSlider();
        return scope.filteredConnections.slice(arg1, arg2);
      };
    }
  ]);

}).call(this);

angular.module('alfredDirective').run(['$templateCache', function ($templateCache) {
	$templateCache.put('src/templates/alfred.html', '<div id="{{uid}}" class="alfred-widget" ng-click="setFocusAtInput()"> <div class="alfred"> <md-toolbar class="alfred-toolbar"> <div class="tollbar-container"> <div class="head-toolbar"> <div class="alfred-input"> <lx-text-field label={{placeholder}} fixed-label="true"> <input type="text" ng-model="query" ng-keydown="keydown($event)"> </lx-text-field> </div> <div class="menu-toolbar"> <button class="btn btn--m btn--icon history-menu"> <i ng-if="isLeftActive" class="mdi mdi-menu" ng-click="changeActiveList()"></i> <i ng-if="isRightActive" class="mdi mdi-keyboard-backspace" ng-click="changeActiveList()"></i> </button> </div> </div> <div ng-if="isLeftActive" class="head-groups"> <div class="parent-group"> <ul> <li> <a ng-click="filterByGroup(null)"><img src="/src/img/icons/icons_group.png"></a> </li> <li ng-repeat="group in path_groups" class="parent-group-list"> <a ng-click="filterByGroup(group.local_id)"> <i class="mdi mdi-chevron-right"></i> {{group.label}} </a> </li> </ul> </div> <div class="tags"> <lx-dropdown class="tag-toolbar" position="right"> <button class="btn btn--m btn--icon" lx-ripple lx-dropdown-toggle> <i class="mdi mdi-tag"></i> </button> <lx-dropdown-menu> <ul class="tag-list"> <li class="list-row list-row--has-primary" ng-repeat="tag in tags"> <div class="list-primary-tile"> <i ng-if="isCheckTag(tag)" class="mdi mdi-check"></i> </div> <div class="list-content-tile"> <a class="dropdown-link" ng-click="selectTag(tag)">{{tag.label}}</a> </div> </li> </ul> </lx-dropdown-menu> </lx-dropdown> <ul> <li ng-repeat="tag in chosen_tags"> <md-button>{{tag.label}}</md-button> </li> </ul> </div> </div> <div ng-if="isLeftActive" class="bottom-group"> <div class="children-group"> <ul> <li> <button class="btn btn--l btn--white btn--raised" lx-ripple ng-click="addNewGroup()">+ </button> </li> <li ng-repeat="group in children_group"> <button class="btn btn--l btn--white btn--raised" lx-ripple ng-click="filterByGroup(group.local_id)">{{group.label}} </button> </li> </ul> </div> </div> </div> </md-toolbar> <md-content class="content-box" ng-if="connections.length || histories.length"> <div class="table"> <div id="left" ng-class="{ active: isLeftActive }" ng-if="isLeftActive"> <div class="left-list" ng-if="isLeftActive"> <active-list connections="connections" amount="amount" height-cell="heightCell" query="query" from="fromConnection" selected-index="selectedIndex" rest="restOfConnections" cmd-system-hotkey="cmdSystemHotkey"> </active-list> </div> </div> <div id="right" ng-class="{ active: isRightActive }" ng-if="isRightActive"> <div class="left-list" ng-if="isRightActive"> <active-list connections="histories" amount="amount" height-cell="heightCell" query="query" from="fromHistory" selected-index="selectedIndex" rest="restOfHistories" cmd-system-hotkey="cmdSystemHotkey"> </active-list> </div> </div> </div> </md-content> </div> </div> ');
	$templateCache.put('src/templates/active-connections.html', '<div id="fixed" when-scrolled="loadMore()" ng-mouseover="toggleScroll()"> <md-list> <md-item ng-repeat="(key,connection) in subConnections=(connections | filterConnections:query:from:offset:this) track by key" id="{{key}}" ng-click="select($event, connection, key)" connection-item="connection" key="{{key}}" ng-class="{ active: (key===selectedIndex) }" ng-style="setHeight()" context-menu class="panel panel-default position-fixed" data-target="menu-{{ $index }}" ng-class="{ \'highlight\': highlight, \'expanded\' : expanded }"> <md-item-content> <div class="md-tile-left host-icon"> <img src="/src/img/icons/hosts/Host-icon_disable_light.png"/> </div> <div class="md-tile-content"> <h4 ng-if="connection.label">{{connection.label}}</h4> <h4 ng-if="!connection.label">{{connection.username}}@{{connection.address}}</h4> </div> <div class="md-tile-right"> <i class="active actions" ng-if="(key===selectedIndex)"> <i>{{enterText}}</i> </i> <i ng-if="!(key===selectedIndex)">{{cmdSystemHotkey}}{{key+1}}</i> </div> <div class="dropdown position-fixed" id="menu-{{ $index }}"> <md-list class="dropdown-menu host-menu" role="menu"> <md-item> <md-item-content ng-if="!isHistory(connection)" ng-click="edit($event, connection)"> <div class="md-tile-left"> <i class="mdi mdi-pencil"></i> </div> <div class="md-tile-content"> Edit </div> </md-item-content> <md-item-content ng-if="isHistory(connection)" ng-click="upload($event, connection)"> <div class="md-tile-left"> <i class="mdi mdi-pencil"></i> </div> <div class="md-tile-content"> Edit </div> </md-item-content> <md-item-content ng-click="remove($event, connection)"> <div class="md-tile-left"> <i class="mdi mdi-delete"></i> </div> <div class="md-tile-content"> Remove </div> </md-item-content> <md-item-content ng-click="select($event, connection, key)"> <div class="md-tile-left"> <i> <img src="/src/img/icons/connect.png"/></i> </div> <div class="md-tile-content"> Connect </div> </md-item-content> </md-item> </md-list> </div> </md-item-content> <md-divider inset></md-divider> </md-item> <md-button ng-show="subConnections.length" class="add-buttom md-fab md-primary" aria-label="Use Android" ng-click="addConnection($event)">+ </md-button> </md-list> </div> <div class="scroller" ng-if="filteredConnections.length> amount"> <div class="sizer" ng-style="setSizerHeight()"></div> <div class="slider" ng-style="setSliderHeight()"></div> </div> </div> ');
	$templateCache.put('src/templates/inactive-connections.html', '<div id="inactive-list"> <ul class="list-group"> <li ng-repeat="(key,connection) in (connections | filterConnections:null:from:offset:this) track by key" ng-style="setHeight()"> <span ng-if="connection.label"> {{connection.label}} </span> <span ng-if="!connection.label"> {{connection.ssh_username}}@{{connection.hostname}} </span> </li> <li ng-repeat="i in rest track by $index" ng-style="setHeight()" class="empty-cell"> </li> </ul> </div> <div class="scroller" ng-if="connections.length> amount"> <div class="sizer" ng-style="setSizerHeight()"></div> <div class="slider" ng-style="setSliderHeight()"></div> </div>');
}]);