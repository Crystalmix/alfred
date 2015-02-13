(function() {
  'use strict';
  var AlfredController;

  AlfredController = (function() {
    AlfredController.$inject = ['$scope', 'Connections', 'Histories'];

    function AlfredController(scope, Connections, Histories) {
      var sa;
      this.scope = scope;
      this.Connections = Connections;
      this.Histories = Histories;

      /*@Histories.query {},(response) =>
                              @scope.histories = response
      @Connections.query {}, (response) =>
                              @scope.connections = response
                               *@modifiedConnection connection for connection in @scope.connections
       */
      this.scope.enterConnection = function(connection) {
        return console.log("--- outerController", connection);
      };
      this.scope.addConnection = function() {
        return console.log("--- outerController add connection");
      };
      this.scope.editConnection = function(connection) {
        return console.log("--- outerController edit connection", connection);
      };
      this.scope.uploadConnection = function(connection) {
        return console.log("--- outerController upload connection", connection);
      };
      this.scope.removeConnection = function(connection) {
        return console.log("--- outerController remove connection", connection);
      };
      this.scope.placeholder = "ssh user@hostname -p port";
      this.scope.query = null;
      this.scope.activities = [];
      this.scope.hosts = [];
      this.scope.groups = [];
      this.scope.childgroups = [];
      this.scope.tags = [];
      sa = new SA("https://serverauditor.com");
      sa.init().done((function(_this) {
        return function() {
          return sa.auth("zhulduz.zhankenova@crystalnix.com", "1");
        };
      })(this));
      sa.on(sa.event_names.MERGED_FULL_SYNC, (function(_this) {
        return function() {
          _this.scope.hosts = sa.hosts;
          _this.scope.groups = sa.groups;
          _this.scope.tags = sa.tags;
          _this.scope.histories = sa.histories;
          _this.scope.showAlfred = true;
          return _this.scope.$apply();
        };
      })(this));
    }

    return AlfredController;

  })();

  angular.module('alfredApp').controller('AlfredController', AlfredController);

}).call(this);
