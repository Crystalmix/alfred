(function() {
  'use strict';
  var AlfredController;

  AlfredController = (function() {
    AlfredController.$inject = ['$scope', 'Connections', 'Histories'];

    function AlfredController(scope, Connections, Histories) {
      this.scope = scope;
      this.Connections = Connections;
      this.Histories = Histories;
      this.scope.histories = this.Histories.query();
      this.Connections.query({}, (function(_this) {
        return function(response) {
          var connection, _i, _len, _ref, _results;
          _this.scope.connections = response;
          _ref = _this.scope.connections;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            connection = _ref[_i];
            _results.push(_this.modifiedConnection(connection));
          }
          return _results;
        };
      })(this));
      this.scope.query = null;
    }

    AlfredController.prototype.modifiedConnection = function(connection) {
      if (!connection.label) {
        return connection.label = "" + connection.ssh_username + "@" + connection.hostname;
      }
    };

    return AlfredController;

  })();

  angular.module('alfredApp').controller('AlfredController', AlfredController);

}).call(this);
