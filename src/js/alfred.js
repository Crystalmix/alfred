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
          activities: "=",
          groups: "=",
          taghosts: "=",
          tags: "=",
          amount: "=",
          heightCell: "=",
          placeholder: "=",
          template: "=",
          onEnterHostCallback: "&",
          onAddHostCallback: "&",
          onEditHostCallback: "&",
          onUploadCallback: "&",
          onRemoveCallback: "&",
          onAddGroupCallback: "&",
          onEditGroupCallback: "&",
          onRemoveGroupCallback: "&"
        },
        controller: function($scope, $element) {
          var filter_hosts_by_chosen_tags, getConnections, getGroups, transformationData;
          $scope.query = null;
          $scope.selectedIndex = 0;
          $scope.current_group = null;
          $scope.chosen_tags = [];
          getGroups = function() {
            var current_group_id;
            current_group_id = $scope.current_group ? $scope.current_group.get('local_id') : null;
            $scope.path_groups = current_group_id ? $scope.groups.get_parent_groups(current_group_id) : [];
            $scope.path_groups.reverse();
            $scope.children_group = current_group_id ? _.rest($scope.groups.get_all_children(current_group_id)) : $scope.groups.get_root();
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
            var array_id_of_hosts, array_of_local_id_of_tags, tag_hosts;
            tag_hosts = [];
            array_id_of_hosts = [];
            array_of_local_id_of_tags = [];
            _.each($scope.chosen_tags, function(val) {
              return array_of_local_id_of_tags = _.union(array_of_local_id_of_tags, val.local_id);
            });
            tag_hosts = $scope.taghosts.intersection_by_tags(array_of_local_id_of_tags);
            _.each(tag_hosts, function(val) {
              if (val.get("host").local_id) {
                return array_id_of_hosts = _.union(array_id_of_hosts, val.get("host").local_id);
              }
            });
            if (tag_hosts.length) {
              return $scope.connections = _.filter($scope.connections, function(val) {
                if (_.contains(array_id_of_hosts, val.get("local_id"))) {
                  return val;
                }
              });
            }
          };
          getConnections = function() {
            if ($scope.current_group) {
              $scope.connections = $scope.hosts.filter_by_group($scope.current_group.get('local_id'), true);
            } else {
              $scope.connections = _.clone($scope.hosts.models);
            }
            filter_hosts_by_chosen_tags();
            return _.each($scope.connections, function(val, key) {
              if (val.get_ssh_identity()) {
                val.set({
                  username: val.get_ssh_identity().get("username")
                });
                val.set({
                  password: val.get_ssh_identity().get("password")
                });
                val.set({
                  key: val.get_ssh_identity().get("key")
                });
              }
              return $scope.connections[key] = val.toJSON({
                do_not_encrypt: false
              });
            });
          };
          transformationData = function() {
            if ($scope.tags) {
              $scope.copy_tags = $scope.tags.toJSON({
                do_not_encrypt: false
              });
            }
            if ($scope.groups) {
              getGroups();
            }
            if ($scope.hosts) {
              return getConnections();
            }
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
            if ($scope.connections.length && $scope.activities.length) {
              $scope.isLeftActive = !$scope.isLeftActive;
              $scope.isRightActive = !$scope.isRightActive;
            }
            return false;
          };
          $scope.isCheckTag = function(tag) {
            var tags;
            tags = [];
            tags = tag ? _.find($scope.chosen_tags, function(val) {
              return val.local_id === tag.local_id;
            }) : void 0;
            if (tags) {
              return true;
            } else {
              return false;
            }
          };
          $scope.filterByTag = function(tag) {
            if (tag) {
              if ($scope.isCheckTag(tag)) {
                $scope.chosen_tags = _.without($scope.chosen_tags, _.findWhere($scope.chosen_tags, tag.local_id));
              } else {
                $scope.chosen_tags = _.union($scope.chosen_tags, tag);
              }
            } else {
              $scope.chosen_tags = [];
            }
            return $timeout((function() {
              return transformationData();
            }));
          };
          $scope.enter = (function(_this) {
            return function() {
              var connection;
              if ($scope.query && $scope.query.indexOf("ssh") !== -1) {
                connection = quickConnectParse.parse($scope.query);
                return _this.enterCallback(connection);
              }
            };
          })(this);
          jwerty.key('→', (function() {
            if ($scope.is_interrupt_arrow_commands === true && $scope.activities.length) {
              $scope.isLeftActive = false;
              return $scope.isRightActive = true;
            } else if ($scope.scope.is_interrupt_arrow_commands === false) {
              return true;
            }
          }), $element);
          jwerty.key('←', (function() {
            if ($scope.is_interrupt_arrow_commands === true && $scope.hosts.length) {
              $scope.isLeftActive = true;
              return $scope.isRightActive = false;
            } else if ($scope.scope.is_interrupt_arrow_commands === false) {
              return true;
            }
          }), $element);
          jwerty.key('⇥', (function() {
            if ($scope.is_interrupt_arrow_commands === false && $scope.hosts.length && $scope.activities.length) {
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

          /*
              Methods are api between alfred directive and child directives
           */
          this.setSelectedIndex = function(key) {
            return $scope.setSelectedConnection(key);
          };
          this.enterCallback = function(connection) {
            if (connection) {
              return $scope.onEnterHostCallback({
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
              return $scope.onEditHostCallback({
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
            return $scope.onAddHostCallback();
          };
          transformationData();
          return this;
        },
        link: function(scope, element, attrs) {
          var $input, changeConnectState, checkQuery, initializeParameters, initializeTableParameters;
          $input = element.find('#alfred-input');
          scope.is_interrupt_arrow_commands = true;
          if (!angular.isDefined(attrs.onEnterHostCallback)) {
            scope.onEnterHostCallback = function(connection) {
              $input.trigger("onEnterHostCallback", connection.connection);
              return false;
            };
          }
          if (!angular.isDefined(attrs.onAddHostCallback)) {
            scope.onAddHostCallback = function() {
              $input.trigger("onAddHostCallback");
              return false;
            };
          }
          if (!angular.isDefined(attrs.onEditHostCallback)) {
            scope.onEditHostCallback = function(connection) {
              $input.trigger("onEditHostCallback", connection.connection);
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
          if (!angular.isDefined(attrs.onAddGroupCallback)) {
            scope.onAddGroupCallback = function(group) {
              $input.trigger("onAddGroupCallback", group);
              return false;
            };
          }
          if (!angular.isDefined(attrs.onEditGroupCallback)) {
            scope.onEditGroupCallback = function(group) {
              $input.trigger("onEditGroupCallback", group);
              return false;
            };
          }
          if (!angular.isDefined(attrs.onRemoveGroupCallback)) {
            scope.onRemoveGroupCallback = function(group) {
              $input.trigger("onRemoveGroupCallback", group);
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
              scope.is_interrupt_arrow_commands = false;
            } else {
              scope.is_interrupt_arrow_commands = true;
            }
            return scope.$apply();
          };
          initializeParameters = function() {
            scope.fromConnection = 0;
            scope.fromHistory = 0;
            scope.selectedIndex = 0;
            return scope.connectState = false;
          };
          initializeTableParameters = function() {
            scope.isLeftActive = scope.hosts.length ? true : false;
            return scope.isRightActive = scope.hosts.length ? false : true;
          };
          changeConnectState = function(state) {
            scope.connectState = state;
            return scope.$apply();
          };
          scope.keydown = function() {
            return $timeout((function() {
              checkQuery();
              if (scope.query && scope.query.indexOf("ssh") === 0) {
                return changeConnectState(true);
              } else {
                return changeConnectState(false);
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
        selectedIndex: "="
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
          if ($event) {
            $event.preventDefault();
            $event.stopPropagation();
          }
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
            return scope.select(null, connection, key);
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

  alfredDirective.directive("whenScrolled", function() {
    return {
      restrict: "A",
      link: function(scope, element) {
        return element.bind("mousewheel", function(event) {
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
	$templateCache.put('src/templates/alfred.html', '<div id="{{uid}}" class="alfred-widget" flex-container="row" ng-click="setFocusAtInput()"> <div class="alfred" flex-item="8"> <div class="alfred-box"> <div class="toolbar alfred-toolbar"> <div class="tollbar-container"> <div flex-container="row"> <div flex-item="10"> <lx-text-field label={{placeholder}} fixed-label="true"> <input type="text" ng-model="query" ng-keydown="keydown($event)"> </lx-text-field> </div> <div class="menu-toolbar" flex-item="2"> <button class="btn btn--m btn--blue btn--flat" lx-ripple> <span ng-if="isLeftActive && !connectState" ng-click="changeActiveList()">activities</span> <span ng-if="isLeftActive && connectState" ng-click="enter()">connect</span> <!--Button for activities--> <span> <i ng-if="isRightActive" class="mdi mdi-keyboard-backspace" ng-click="changeActiveList()"></i> </span> </button> </div> </div> <!--Filters by group, tag--> <div flex-container="row"> <div flex-item="8"> <div ng-if="path_groups.length" class="parent-group"> <ul> <li class="parent-group-list"> <a ng-click="filterByGroup(null)">show all</a> </li> <li class="parent-group-list" ng-repeat="group in path_groups"> <a ng-click="filterByGroup(group.local_id)"> <i class="mdi mdi-chevron-right"></i> {{group.label}} </a> </li> </ul> </div> <!--Child groups--> <div class="children-group"> <ul> <li> <button class="btn btn--l btn--white btn--raised add-new-group" ng-click="onAddGroupCallback()" lx-ripple lx-tooltip="Add new group" tooltip-position="bottom"> <i class="group-icon"></i> </button> </li> <li ng-repeat="group in children_group"> <button class="btn btn--l btn--white btn--raised" lx-ripple ng-click="filterByGroup(group.local_id)">{{group.label}} </button> </li> </ul> </div> </div> <div flex-item="4"> <div class="tags"> <lx-dropdown class="tag-toolbar" position="right"> <button class="btn btn--m btn--icon" lx-ripple lx-dropdown-toggle> <i class="mdi mdi-tag tag"></i> </button> <lx-dropdown-menu> <ul class="tag-list"> <li class="list-row list-row--has-primary" ng-repeat="tag in copy_tags"> <div class="list-primary-tile"> <i ng-if="isCheckTag(tag)" class="mdi mdi-check"></i> </div> <div class="list-content-tile"> <a class="dropdown-link" ng-click="filterByTag(tag)">{{tag.label}}</a> </div> </li> <li class="list-row list-row--has-primary"> <div class="list-primary-tile"> <i ng-if="isCheckTag(null)" class="mdi mdi-check"></i> </div> <div class="list-content-tile"> <a class="dropdown-link" ng-click="filterByTag()">deselect all</a> </div> </li> </ul> </lx-dropdown-menu> </lx-dropdown> <ul> <li class="mb" ng-repeat="tag in chosen_tags"> <button class="btn btn--s btn--blue btn--raised" lx-ripple>{{tag.label}} </button> </li> </ul> </div> </div> </div> <!--<div ng-if="isLeftActive" class="head-groups">--> <!--<ul>--> <!--<a ng-click="filterByGroup(null)"><i class="group-icon"></i></a>--> <!--<li ng-repeat="group in path_groups" class="parent-group-list">--> <!--<i class="mdi mdi-chevron-right"></i>--> <!--</a>--> <!--</ul>--> <!--<div class="tags">--> <!--<button class="btn btn--m btn--icon" lx-ripple lx-dropdown-toggle>--> <!--</button>--> <!--<ul class="tag-list">--> <!--<div class="list-primary-tile">--> <!--</div>--> <!--<a class="dropdown-link" ng-click="filterByTag(tag)">{{tag.label}}</a>--> <!--</li>--> <!--</lx-dropdown-menu>--> <!--<ul>--> <!--<button class="btn btn--s btn--blue btn--raised" lx-ripple>{{tag.label}}</button>--> <!--</ul>--> <!--</div>--> <!--<div class="children-group">--> <!--<li>--> <!--ng-click="addNewGroup()">+--> <!--</li>--> <!--<button class="btn btn--l btn--white btn--raised" lx-ripple--> <!--</button>--> <!--</ul>--> <!--</div>--> </div> </div> <div class="content-box" ng-if="connections.length || activities.length"> <div class="table"> <div id="left" ng-class="{ active: isLeftActive }" ng-if="isLeftActive"> <div class="left-list" ng-if="isLeftActive"> <active-list connections="connections" amount="amount" height-cell="heightCell" query="query" from="fromConnection" selected-index="selectedIndex"> </active-list> </div> </div> <div id="right" ng-class="{ active: isRightActive }" ng-if="isRightActive"> <div class="left-list" ng-if="isRightActive"> <active-list connections="activities" amount="amount" height-cell="heightCell" query="query" from="fromHistory" selected-index="selectedIndex"> </active-list> </div> </div> </div> </div> </div> </div> </div> ');
	$templateCache.put('src/templates/active-connections.html', '<div id="fixed" when-scrolled="loadMore()" ng-mouseover="toggleScroll()"> <ul class="list"> <li ng-repeat="(key,connection) in subConnections=(connections | filterConnections:query:from:offset:this) track by key" id="{{key}}" ng-click="select($event, connection, key)" connection-item="connection" key="{{key}}" ng-class="{ active: (key===selectedIndex) }" ng-style="setHeight()" context-menu class="panel panel-default position-fixed list-row" data-target="menu-{{ $index }}" ng-class="{ \'highlight\': highlight, \'expanded\' : expanded }"> <div class="list-row__primary"> <i class="icon icon--l host_default_icon"></i> </div> <div class="list-row__content"> <span ng-if="connection.label" class="display-block">{{connection.label}}</span> <span ng-if="!connection.label && connection.username" class="display-block">{{connection.username}}@{{connection.address}}</span> <span ng-if="!connection.label && !connection.username" class="display-block">{{connection.address}}</span> </div> <div class="dropdown position-fixed context-menu" id="menu-{{ $index }}"> <ul class="list dropdown-menu host-menu" role="menu"> <li class="list-row" ng-if="!isHistory(connection)" ng-click="edit($event, connection)"> <div class="list-row__primary"> <i class="mdi mdi-pencil"></i> </div> <div class="list-row__content"> <span>Edit</span> </div> </li> <li class="list-row" ng-if="isHistory(connection)" ng-click="upload($event, connection)"> <div class="list-row__primary"> <i class="mdi mdi-pencil"></i> </div> <div class="list-row__content"> Edit </div> </li> <li class="list-row" ng-click="remove($event, connection)"> <div class="list-row__primary"> <i class="mdi mdi-delete"></i> </div> <div class="list-row__content"> Remove </div> </li> <li class="list-row" ng-click="select($event, connection, key)"> <div class="list-row__primary"> <i class="connect-icon"></i> </div> <div class="list-row__content"> Connect </div> </li> </ul> </div> </li> <button class="btn btn--m btn--blue btn--fab add-buttom" ng-hide="!subConnections.length" ng-click="addConnection($event)" lx-ripple> <i class="mdi mdi-plus"></i> </button> </ul> </div> <div class="scroller" ng-if="filteredConnections.length> amount"> <div class="sizer" ng-style="setSizerHeight()"></div> <div class="slider" ng-style="setSliderHeight()"></div> </div> ');
}]);