(function() {
  'use strict';
  var alfredDirective;

  alfredDirective = angular.module("alfredDirective", []);


  /*
      A helper service that can parse quick connect parameters
      Possible cases:
          ssh               user@host
          ssh               user@host   -p port
          ssh               user@host   -pport
  
          ssh    -p port    user@host
          ssh    -pport     user@host
   */

  alfredDirective.factory("quickConnectParse", [
    "constant", function(constant) {
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
              options[constant.host.username] = value[0];
              return options[constant.host.address] = value[1];
            }
          });
          parser.on(2, function(value) {
            return options.other_args = value;
          });
          query = input.replace(/\s+@/g, '@').replace(/@\s+/g, '@').split(/\s+/);
          parser.parse(query);
          if (cmd === 'ssh') {
            if (!options[constant.host.username] || !options[constant.host.address] || (options.other_args != null)) {
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
    }
  ]);


  /*
      A helper service that can return constants
   */

  alfredDirective.constant("constant", {
    local_id: "local_id",
    host: {
      label: "label",
      username: "username",
      address: "address",
      port: "port"
    },
    tag_host: {
      host: "host",
      tag: "tag"
    },
    status: {
      "delete": "DELETE_FAILED"
    }
  });


  /*
      The alfred directive indicates input field, determines display table or list
   */

  alfredDirective.directive("alfred", [
    "quickConnectParse", "$timeout", "constant", function(quickConnectParse, $timeout, constant) {
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
          onAddGroupCallback: "&",
          onEditGroupCallback: "&",
          onRemoveGroupCallback: "&",
          onEnterHostCallback: "&",
          onAddHostCallback: "&",
          onEditHostCallback: "&",
          onRemoveHostCallback: "&"
        },
        controller: function($scope, $element) {
          var collections_to_update, filter_hosts_by_chosen_tags, getConnections, getGroups, parseConnect, transformationData;
          $scope.query = null;
          $scope.chosen_tags = [];
          $scope.current_group = null;
          $scope.children_group = [];
          $scope.path_groups = [];
          collections_to_update = ["hosts", "groups", "tags", "taghosts"];
          _.each(collections_to_update, function(val) {
            $scope[val].on("change", function(model) {
              if (model.changed["status"] !== constant.status["delete"]) {
                return $timeout((function() {
                  return transformationData();
                }));
              }
            });
            $scope[val].on("add", function() {
              return $timeout((function() {
                return transformationData();
              }));
            });
            return $scope[val].on("destroy", function() {
              return $timeout((function() {
                return transformationData();
              }));
            });
          });
          getGroups = function() {
            var current_group_id;
            current_group_id = $scope.current_group ? $scope.current_group.get("" + constant.local_id) : null;
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
              return array_of_local_id_of_tags = _.union(array_of_local_id_of_tags, val["" + constant.local_id]);
            });
            tag_hosts = $scope.taghosts.intersection_by_tags(array_of_local_id_of_tags);
            _.each(tag_hosts, function(val) {
              if (val.get("" + constant.tag_host.host)["" + constant.local_id]) {
                return array_id_of_hosts = _.union(array_id_of_hosts, val.get("" + constant.tag_host.host)["" + constant.local_id]);
              }
            });
            if (tag_hosts.length) {
              return $scope.connections = _.filter($scope.connections, function(val) {
                if (_.contains(array_id_of_hosts, val.get("" + constant.local_id))) {
                  return val;
                }
              });
            }
          };
          getConnections = function() {
            if ($scope.current_group) {
              $scope.connections = $scope.hosts.filter_by_group($scope.current_group.get("" + constant.local_id), true);
            } else {
              $scope.connections = _.clone($scope.hosts.models);
            }
            filter_hosts_by_chosen_tags();
            _.each($scope.connections, (function(_this) {
              return function(connection, key) {
                return $scope.connections[key] = $scope.connections[key].toJSON({
                  do_not_encrypt: false
                });
              };
            })(this));
            return _.each($scope.connections, function(val, key) {
              var username_object;
              username_object = $scope.hosts.models[key].get_merged_username();
              if (username_object && username_object.username) {
                return val.username = username_object.username;
              } else {
                return val.username = null;
              }
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
          parseConnect = (function(_this) {
            return function(json) {
              var connection, e;
              try {
                connection = quickConnectParse.parse(json);
                return _this.enterCallback(connection);
              } catch (_error) {
                e = _error;
                return console.warn(e, json);
              }
            };
          })(this);
          $scope.isChosenTag = function(tag) {
            tag = tag ? _.findWhere($scope.chosen_tags, {
              local_id: tag["" + constant.local_id]
            }) : [];
            if (tag) {
              return true;
            } else {
              return false;
            }
          };
          $scope.filterByGroup = function(group) {
            var id;
            id = group ? group["" + constant.local_id] : null;
            $scope.current_group = id ? $scope.groups.get(id) : null;
            return $timeout((function() {
              return transformationData();
            }));
          };
          $scope.filterByTag = function(tag) {
            if (tag) {
              if ($scope.isChosenTag(tag)) {
                $scope.chosen_tags = _.without($scope.chosen_tags, _.findWhere($scope.chosen_tags, {
                  local_id: tag["" + constant.local_id]
                }));
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
          $scope.setSelectedConnection = function(index) {
            $scope.selectedIndex = index;
            return $scope.$broadcast("setSelectedIndex", index);
          };
          $scope.changeActiveList = function() {
            $scope.isLeftActive = !$scope.isLeftActive;
            return $scope.isRightActive = !$scope.isRightActive;
          };
          $scope.enter = (function(_this) {
            return function() {
              if ($scope.query && $scope.query.indexOf("ssh") !== -1) {
                return parseConnect($scope.query);
              }
            };
          })(this);
          $scope.editGroup = function(group) {
            var group_model;
            group_model = $scope.groups.get(group["" + constant.local_id]) || $scope.groups.get(group.id);
            if (group_model) {
              return $scope.onEditGroupCallback({
                group: group_model
              });
            }
          };
          $scope.removeGroup = function(group) {
            var group_model;
            group_model = $scope.groups.get(group["" + constant.local_id]) || $scope.groups.get(group.id);
            if (group_model) {
              return $scope.onRemoveGroupCallback({
                group: group_model
              });
            }
          };
          $scope.safeApply = function(expr) {
            if (!$scope.$$phase) {
              if (expr) {
                return $scope.$apply(expr);
              } else {
                return $scope.$apply();
              }
            }
          };
          jwerty.key('→', (function() {
            if ($scope.is_interrupt_arrow_commands === true) {
              $scope.isLeftActive = false;
              $scope.isRightActive = true;
              return false;
            } else {
              return true;
            }
          }), $element);
          jwerty.key('←', (function() {
            if ($scope.is_interrupt_arrow_commands === true) {
              $scope.isLeftActive = true;
              $scope.isRightActive = false;
              return false;
            } else {
              return true;
            }
          }), $element);
          jwerty.key('⇥', (function() {
            if ($scope.is_interrupt_arrow_commands === true) {
              $scope.isLeftActive = !$scope.isLeftActive;
              $scope.isRightActive = !$scope.isRightActive;
              return false;
            } else {
              return true;
            }
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
              if ($scope.query && $scope.query.indexOf("ssh") !== -1) {
                return parseConnect($scope.query);
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
          this.enterCallback = function(host) {
            var host_model;
            if (host) {
              host_model = $scope.hosts.get(host["" + constant.local_id]) || host;
              if (host_model) {
                return $scope.onEnterHostCallback({
                  host: host_model
                });
              }
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
            return $scope.safeApply();
          };
          this.edit = function(connection, always_open_form) {
            var connection_model;
            if (connection) {
              connection_model = $scope.hosts.get(connection["" + constant.local_id]) || $scope.hosts.get(connection.id);
              if (connection_model) {
                return $scope.onEditHostCallback({
                  host: connection_model,
                  always_open_form: always_open_form
                });
              }
            }
          };
          this.removeConnection = function(connection) {
            var connection_model;
            if (connection) {
              connection_model = $scope.hosts.get(connection["" + constant.local_id]) || $scope.hosts.get(connection.id);
              if (connection_model) {
                return $scope.onRemoveHostCallback({
                  host: connection_model
                });
              }
            }
          };
          this.addConnection = function(current_group) {
            return $scope.onAddHostCallback({
              parent_group: current_group
            });
          };
          this.addGroup = function(current_group) {
            return $scope.onAddGroupCallback({
              parent_group: current_group
            });
          };
          transformationData();
          return this;
        },
        link: function(scope, element, attrs) {
          var $input, changeConnectState, checkQuery, initializeParameters, initializeTableParameters;
          $input = element.find('#alfred-input');
          scope.is_interrupt_arrow_commands = true;
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
            return scope.safeApply();
          };
          initializeParameters = function() {
            scope.fromConnection = 0;
            scope.fromHistory = 0;
            scope.selectedIndex = null;
            return scope.connectState = false;
          };
          initializeTableParameters = function() {
            scope.isLeftActive = true;
            return scope.isRightActive = false;
          };
          changeConnectState = function(state) {
            scope.connectState = state;
            return scope.safeApply();
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
        selectedIndex: "=",
        currentGroup: "=",
        uid: "="
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
        $scope.safeApply = function(expr) {
          if (!$scope.$$phase) {
            if (expr) {
              return $scope.$apply(expr);
            } else {
              return $scope.$apply();
            }
          }
        };
        this.select = function(key) {
          $scope.setSelectedConnection(key);
          return $scope.safeApply();
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
            return scope.connect(connection, key);
          }
        });
        scope.addConnection = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          return alfredCtrl.addConnection(scope.currentGroup);
        };
        scope.addGroup = function($event) {
          $event.preventDefault();
          $event.stopPropagation();
          return alfredCtrl.addGroup(scope.currentGroup);
        };
        scope.edit = function(connection) {
          var always_open_form;
          always_open_form = true;
          return alfredCtrl.edit(connection, always_open_form);
        };
        scope.remove = function(connection) {
          return alfredCtrl.removeConnection(connection);
        };
        scope.select = function(key) {
          var always_open_form;
          scope.setSelectedConnection(key);
          always_open_form = false;
          return alfredCtrl.edit(scope.subConnections[key], always_open_form);
        };
        scope.connect = function(connection, key) {
          scope.select(key);
          alfredCtrl.enterCallback(connection);
          return false;
        };
        scope.changeSlider = function() {
          var sizer, sizes, slider;
          slider = (scope.amount * 100) / scope.filteredConnections.length;
          sizer = (scope.from * 100) / scope.filteredConnections.length;
          sizes = _normalizeSliderHeight(slider, sizer);
          scope.slider = sizes.sliderHeight;
          return scope.sizer = sizes.sizerHeight;
        };
        scope.setSelectedConnection = function(index) {
          return scope.selectedIndex = index;
        };
        scope.getSelectedConnection = function() {
          return scope.selectedIndex;
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
    "$filter", "constant", function($filter, constant) {
      return function(input, query, arg1, arg2, context) {
        var filterFilter, scope;
        scope = context;
        if (scope.prevquery !== scope.query && scope.query !== "") {
          scope.initializeParameteres();
          scope.prevquery = scope.query;
        }
        filterFilter = $filter("filter");
        scope.filteredConnections = filterFilter(scope.connections, function(value) {
          var isMatchAddress, isMatchLabel, isMatchUsername;
          if (!scope.query) {
            return value;
          } else {
            isMatchLabel = function(value) {
              if (value["" + constant.host.label]) {
                return value["" + constant.host.label].indexOf(scope.query) !== -1;
              }
              return false;
            };
            isMatchAddress = function(value) {
              if (value["" + constant.host.address]) {
                return value["" + constant.host.address].indexOf(scope.query) !== -1;
              }
              return false;
            };
            isMatchUsername = function(value) {
              if (value["" + constant.host.username]) {
                return value["" + constant.host.username].indexOf(scope.query) !== -1;
              }
              return false;
            };
            return isMatchLabel(value) || isMatchAddress(value) || isMatchUsername(value);
          }
        });
        scope.changeSlider();
        return scope.filteredConnections.slice(arg1, arg2);
      };
    }
  ]);

}).call(this);

angular.module('alfredDirective').run(['$templateCache', function ($templateCache) {
	$templateCache.put('src/templates/alfred.html', '<div id="{{ uid }}" class="alfred-widget" flex-container="row"> <div class="alfred flex-list" flex-item="8"> <div class="alfred-box"> <div class="toolbar alfred-toolbar"> <div class="tollbar-container"> <div class="input-row"> <div class="input-fiedls"> <lx-text-field label={{placeholder}} fixed-label="true"> <input type="text" id="alfred-input" ng-model="query" ng-keydown="keydown($event)"> </lx-text-field> </div> <div class="menu-toolbar"> <button class="btn btn--m btn--blue btn--flat" lx-ripple ng-click="changeActiveList()"> <span ng-if="isLeftActive && !connectState">activity</span> <span ng-if="isRightActive"><i class="mdi mdi-keyboard-backspace"></i></span> </button> <!--Buttons for quick connect--> <button class="btn btn--m btn--blue btn--flat" lx-ripple ng-if="isLeftActive && connectState" ng-click="enter()"> <span>connect</span> </button> </div> </div> <!--Filters by group, tag--> <div flex-container="row"> <div flex-item="8"> <div ng-if="path_groups.length" class="parent-group"> <ul> <li class="parent-group-list"> <a ng-click="filterByGroup(null)"><b>All hosts</b></a> </li> <li class="parent-group-list" ng-repeat="group in path_groups"> <a ng-click="filterByGroup(group)"> <i class="mdi mdi-chevron-right"></i> {{ group.label }} </a> </li> </ul> </div> <!--Child groups--> <div class="children-group"> <ul> <li ng-repeat="group in children_group" context-menu class="panel panel-default position-fixed" data-target="child_group-{{ uid }}-{{ $index }}" ng-class="{ \'highlight\': highlight, \'expanded\' : expanded }"> <button class="btn btn--l group-child" lx-ripple ng-click="filterByGroup(group)"> <i class="group-child"></i> {{ group.label }} </button> <div class="dropdown position-fixed" id="child_group-{{ uid }}-{{ $index }}"> <ul class="list context-menu group-menu" role="menu"> <li class="list-row" ng-click="editGroup(group)"> <div class="list-row__primary"> <i class="mdi mdi-pencil"></i> </div> <div class="list-row__content"> Edit </div> </li> <li class="list-row" ng-click="removeGroup(group)"> <div class="list-row__primary"> <i class="mdi mdi-delete"></i> </div> <div class="list-row__content"> <span>Remove</span> </div> </li> </ul> </div> </li> </ul> </div> </div> <div flex-item="4"> <div class="tags"> <lx-dropdown class="tag-toolbar" position="right"> <button class="btn btn--m btn--icon" lx-ripple lx-dropdown-toggle> <i class="mdi mdi-tag tag"></i> </button> <lx-dropdown-menu> <ul class="tag-list"> <li class="list-row list-row--has-primary"> <div class="list-primary-tile"> <i ng-if="false" class="mdi mdi-check"></i> </div> <div class="list-content-tile"> <a class="dropdown-link" ng-click="filterByTag()"><b>Deselect all</b></a> </div> </li> <li class="list-row list-row--has-primary" ng-repeat="tag in copy_tags"> <div class="list-primary-tile"> <i ng-if="isChosenTag(tag)" class="mdi mdi-check"></i> </div> <div class="list-content-tile"> <a class="dropdown-link" ng-click="filterByTag(tag)">{{ tag.label }}</a> </div> </li> </ul> </lx-dropdown-menu> </lx-dropdown> <ul> <li class="mb" ng-repeat="tag in chosen_tags"> <button class="btn btn--s btn--blue btn--raised" ng-click="filterByTag(tag)" lx-ripple>{{ tag.label }} </button> </li> </ul> </div> </div> </div> </div> </div> <!--List--> <div class="content-box"> <div class="table"> <div id="left" ng-class="{ active: isLeftActive }" ng-if="isLeftActive"> <div class="left-list" ng-if="isLeftActive"> <active-list connections="connections" uid="uid" amount="amount" height-cell="heightCell" query="query" from="fromConnection" selected-index="selectedIndex" current-group="current_group"> </active-list> </div> </div> <div id="right" ng-class="{ active: isRightActive }" ng-if="isRightActive"> <div class="left-list" ng-if="isRightActive"> <active-list connections="activities" uid="uid" amount="amount" height-cell="heightCell" query="query" from="fromHistory" selected-index="selectedIndex" current-group="current_group"> </active-list> </div> </div> </div> </div> </div> </div> </div> ');
	$templateCache.put('src/templates/active-connections.html', '<div id="fixed" when-scrolled="loadMore()"> <ul class="list"> <li ng-repeat="(key,connection) in subConnections=(connections | filterConnections:query:from:offset:this) track by key" id="{{ key }}" ng-click="select(key)" ng-dblclick="connect(connection, key)" key="{{ key }}" ng-class="{ active: (key===selectedIndex) }" ng-style="setHeight()" context-menu="select(key)" context-menu-disabled="is_disable_context_menu" class="panel panel-default position-fixed list-row" data-target="menu-{{ uid }}-{{ $index }}" ng-class="{ \'highlight\': highlight, \'expanded\' : expanded }"> <div class="list-row__primary"> <i class="icon icon--l host_default_icon"></i> </div> <div class="list-row__content"> <span ng-if="connection.label" class="display-block">{{ connection.label }}</span> <span ng-if="!connection.label" class="display-block">{{ connection.address }}</span> <span class="display-block fs-body-1 description">{{ connection.username }}</span> <div class="dropdown position-fixed" id="menu-{{ uid }}-{{ $index }}"> <ul class="list context-menu host-menu" role="menu"> <li class="list-row" ng-click="connect(connection, key)"> <div class="list-row__primary"> <i class="connect-icon"></i> </div> <div class="list-row__content"> Connect </div> </li> <li class="list-row" ng-if="!isHistory(connection)" ng-click="edit(connection)"> <div class="list-row__primary"> <i class="mdi mdi-pencil"></i> </div> <div class="list-row__content"> <span>Edit</span> </div> </li> <li class="list-row" ng-if="!isHistory(connection)" ng-click="remove(connection)"> <div class="list-row__primary"> <i class="mdi mdi-delete"></i> </div> <div class="list-row__content"> <span>Remove</span> </div> </li> </ul> </div> </div> </li> <li ng-if="!subConnections.length" ng-style="setHeight()" class="panel panel-default position-fixed list-row"> <div class="list-row__content empty-list"> <span class="display-block"> </span> </div> </li> <div class="fab add-buttom"> <button class="fab__primary btn btn--l btn--blue btn--fab" lx-ripple> <i class="mdi mdi-plus"></i> <i class="mdi mdi-plus"></i> </button> <div class="fab__actions fab__actions--left"> <button class="btn btn--m btn--blue btn--fab" lx-ripple lx-tooltip="Add new group" tooltip-position="top" ng-click="addGroup($event)"> <i class="add_new_group"></i> </button> <button class="btn btn--m btn--blue btn--fab" lx-ripple lx-tooltip="Add new host" tooltip-position="top" ng-click="addConnection($event)"> <i class="add_new_host"></i> </button> </div> </div> </ul> </div> <div class="scroller" ng-if="filteredConnections.length> amount"> <div class="sizer" ng-style="setSizerHeight()"></div> <div class="slider" ng-style="setSliderHeight()"></div> </div> ');
}]);