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
          groups: "=",
          taghosts: "=",
          tags: "=",
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
            if ($scope[val]) {
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
            }
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
              if (!$scope.copy_tags || $scope.tags.length !== $scope.copy_tags.length) {
                $scope.copy_tags = $scope.tags.toJSON({
                  do_not_encrypt: false
                });
              }
            } else {
              $scope.copy_tags = [];
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
          $scope.is_selectedIndex = function() {
            if (($scope.selectedIndex != null) && $scope.selectedIndex >= 0) {
              return true;
            }
            return false;
          };
          $scope.enter = (function(_this) {
            return function() {
              if ($scope.query && $scope.query.indexOf("ssh") !== -1) {
                return parseConnect($scope.query);
              }
              if ($scope.is_selectedIndex()) {
                return _this.enterCallback($scope.connections[$scope.selectedIndex]);
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
          $scope.addConnection = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            return $scope.onAddHostCallback({
              parent_group: $scope.current_group
            });
          };
          $scope.addGroup = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            return $scope.onAddGroupCallback({
              parent_group: $scope.current_group
            });
          };
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
          transformationData();
          return this;
        },
        link: function(scope, element, attrs) {
          var $input, changeConnectState, checkQuery, initializeParameters, _is_interrupt_arrow_commands, _setFocusAtInput;
          $input = null;
          $timeout((function() {
            return $input = element.find('#alfred-input');
          }));
          _setFocusAtInput = function() {
            $input.focus();
            return false;
          };
          _is_interrupt_arrow_commands = true;
          checkQuery = function() {
            if (scope.query) {
              return _is_interrupt_arrow_commands = false;
            } else {
              return _is_interrupt_arrow_commands = true;
            }
          };
          initializeParameters = function() {
            scope.selectedIndex = null;
            return scope.connectState = false;
          };
          changeConnectState = function(state) {
            scope.connectState = state;
            return scope.safeApply();
          };
          scope.$on("setFocus", function(event, uid) {
            if (uid === scope.uid) {
              return $timeout((function() {
                return _setFocusAtInput();
              }));
            }
          });
          scope.$watch($input, function() {
            return $timeout((function() {
              return _setFocusAtInput();
            }));
          });
          scope.setFocusAtInput = function($event) {
            if ($($event.target)[0] === element[0]) {
              scope.setSelectedConnection(null);
              return _setFocusAtInput();
            } else {
              return true;
            }
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
          return initializeParameters();
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
        heightCell: "=",
        query: "=",
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
        return this;
      },
      link: function(scope, element, attrs, alfredCtrl) {
        var activateNextItem, activatePreviousItem;
        scope.alfredController = alfredCtrl;
        scope.$watch("selectedIndex", function(key) {
          return alfredCtrl.setSelectedIndex(key);
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
          if (scope.filteredConnections[key] != null) {
            scope.setSelectedConnection(key);
            connection = scope.filteredConnections[key];
            return scope.connect(connection, key);
          }
        });
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
          return alfredCtrl.edit(scope.filteredConnections[key], always_open_form);
        };
        scope.connect = function(connection, key) {
          scope.select(key);
          alfredCtrl.enterCallback(connection);
          return false;
        };
        scope.setSelectedConnection = function(index) {
          return scope.selectedIndex = index;
        };
        scope.getSelectedConnection = function() {
          return scope.selectedIndex;
        };
        activateNextItem = function() {
          var currentIndex, next;
          currentIndex = scope.getSelectedConnection();
          next = scope.filteredConnections[currentIndex + 1];
          if (next == null) {
            return scope.setSelectedConnection(0);
          } else {
            return scope.setSelectedConnection(++currentIndex);
          }
        };
        return activatePreviousItem = function() {
          var currentIndex, prev;
          currentIndex = scope.getSelectedConnection();
          prev = scope.filteredConnections[currentIndex - 1];
          if (prev == null) {
            return scope.setSelectedConnection(scope.filteredConnections.length - 1);
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
      return function(connections, query, context) {
        var filterFilter, filtered, scope;
        scope = context;
        filterFilter = $filter("filter");
        filtered = filterFilter(scope.connections, function(value) {
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
        if (!filtered[scope.selectedIndex]) {
          scope.selectedIndex = null;
        }
        return filtered;
      };
    }
  ]);

}).call(this);

angular.module('alfredDirective').run(['$templateCache', function ($templateCache) {
	$templateCache.put('src/templates/alfred.html', '<div id="{{ uid }}" class="alfred-widget" flex-container="row" ng-click="setFocusAtInput($event)"> <div class="alfred flex-list" flex-item="8"> <div class="alfred-box"> <div class="toolbar alfred-toolbar"> <div class="tollbar-container"> <div class="input-row"> <div class="input-fiedls"> <md-input-container md-no-float> <input type="text" id="alfred-input" ng-model="query" ng-keydown="keydown($event)" placeholder={{placeholder}}> </md-input-container> </div> <div class="menu-toolbar"> <button class="btn btn--m btn--blue btn--flat" lx-ripple ng-if="connectState || is_selectedIndex()" ng-click="enter()"> <span>connect</span> </button> <button class="btn btn--m btn--grey btn--flat btn--is-disabled" lx-ripple ng-if="!connectState && !is_selectedIndex()"> <span>connect</span> </button> </div> </div> </div> </div> <!--Filters by group, tag--> <div class="data-box"> <div class="groups-toolbar"> <div flex-container="row"> <div flex-item="8" class="group-content"> <div ng-if="path_groups.length" class="parent-group"> <ul> <li class="parent-group-list"> <a ng-click="filterByGroup(null)"><b>All hosts</b></a> </li> <li class="parent-group-list" ng-repeat="group in path_groups"> <a ng-click="filterByGroup(group)"> <i class="mdi mdi-chevron-right"></i> {{ group.label }} </a> </li> </ul> </div> <!--Child groups--> <div class="children-group"> <ul> <li ng-repeat="group in children_group" context-menu class="panel panel-default position-fixed" data-target="child_group-{{ uid }}-{{ $index }}" ng-class="{ \'highlight\': highlight, \'expanded\' : expanded }"> <button class="btn btn--l group-child" lx-ripple ng-click="filterByGroup(group)"> <i class="group-child"></i> {{ group.label }} </button> <div class="dropdown position-fixed" id="child_group-{{ uid }}-{{ $index }}"> <ul class="list context-menu group-menu" role="menu"> <li class="list-row" ng-click="editGroup(group)"> <div class="list-row__primary"> <i class="mdi mdi-pencil"></i> </div> <div class="list-row__content"> Edit </div> </li> <li class="list-row" ng-click="removeGroup(group)"> <div class="list-row__primary"> <i class="mdi mdi-delete"></i> </div> <div class="list-row__content"> <span>Remove</span> </div> </li> </ul> </div> </li> </ul> </div> </div> <div flex-item="4" class="tag-content"> <div class="tags"> <lx-dropdown class="tag-toolbar" position="right"> <button class="btn btn--m btn--icon" lx-ripple lx-dropdown-toggle> <i class="mdi mdi-tag tag"></i> </button> <lx-dropdown-menu> <ul class="tag-list"> <li class="list-row list-row--has-primary"> <div class="list-primary-tile"> <i ng-if="false" class="mdi mdi-check"></i> </div> <div class="list-content-tile"> <a class="dropdown-link" ng-click="filterByTag()"><b>Deselect all</b></a> </div> </li> <li class="list-row list-row--has-primary" ng-repeat="tag in copy_tags"> <div class="list-primary-tile"> <i ng-if="isChosenTag(tag)" class="mdi mdi-check"></i> </div> <div class="list-content-tile"> <a class="dropdown-link" ng-click="filterByTag(tag)">{{ tag.label }}</a> </div> </li> </ul> </lx-dropdown-menu> </lx-dropdown> <ul> <li class="mb" ng-repeat="tag in chosen_tags"> <button class="btn btn--s btn--blue btn--raised" ng-click="filterByTag(tag)" lx-ripple>{{ tag.label }} </button> </li> </ul> </div> </div> </div> </div> <!--List--> <div class="content-box"> <div class="table"> <div id="list"> <div class="host-list"> <active-list connections="connections" uid="uid" height-cell="heightCell" query="query" selected-index="selectedIndex" current-group="current_group"> </active-list> </div> </div> </div> </div> </div> </div> <div class="fab add-buttom"> <button class="fab__primary btn btn--l btn--blue btn--fab" lx-ripple> <i class="mdi mdi-plus"></i> <i class="mdi mdi-plus"></i> </button> <div class="fab__actions fab__actions--left"> <button class="btn btn--m btn--blue btn--fab" lx-ripple lx-tooltip="Add new group" tooltip-position="top" ng-click="addGroup($event)"> <i class="add_new_group"></i> </button> <button class="btn btn--m btn--blue btn--fab" lx-ripple lx-tooltip="Add new host" tooltip-position="top" ng-click="addConnection($event)"> <i class="add_new_host"></i> </button> </div> </div> </div> </div> ');
	$templateCache.put('src/templates/active-connections.html', '<div id="fixed"> <ul class="list"> <li ng-repeat="(key,connection) in filteredConnections=(connections | filterConnections:query:this) track by key" id="{{ key }}" ng-click="select(key)" ng-dblclick="connect(connection, key)" key="{{ key }}" ng-class="{ active: (key===selectedIndex) }" ng-style="setHeight()" context-menu="select(key)" context-menu-disabled="is_disable_context_menu" class="panel panel-default position-fixed list-row" data-target="menu-{{ uid }}-{{ $index }}" ng-class="{ \'highlight\': highlight, \'expanded\' : expanded }"> <div class="list-row__primary"> <i class="icon icon--l host_default_icon"></i> </div> <div class="list-row__content"> <span ng-if="connection.label" class="display-block">{{ connection.label }}</span> <span ng-if="!connection.label" class="display-block">{{ connection.address }}</span> <span class="display-block fs-body-1 description">{{ connection.username }}</span> <div class="dropdown position-fixed" id="menu-{{ uid }}-{{ $index }}"> <ul class="list context-menu host-menu" role="menu"> <li class="list-row" ng-click="connect(connection, key)"> <div class="list-row__primary"> <i class="connect-icon"></i> </div> <div class="list-row__content"> Connect </div> </li> <li class="list-row" ng-if="!isHistory(connection)" ng-click="edit(connection)"> <div class="list-row__primary"> <i class="mdi mdi-pencil"></i> </div> <div class="list-row__content"> <span>Edit</span> </div> </li> <li class="list-row" ng-if="!isHistory(connection)" ng-click="remove(connection)"> <div class="list-row__primary"> <i class="mdi mdi-delete"></i> </div> <div class="list-row__content"> <span>Remove</span> </div> </li> </ul> </div> </div> </li> </ul> </div> ');
}]);