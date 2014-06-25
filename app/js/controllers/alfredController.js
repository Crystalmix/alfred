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
      this.scope.connections = [
        {
          "color_scheme": null,
          "hostname": "dev.crystalnix.com",
          "id": 3444,
          "label": "digital",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3444/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "serverauditor",
          "updated_at": "2014-06-20T05:24:31"
        }, {
          "color_scheme": null,
          "hostname": "54.193.87.205",
          "id": 3445,
          "label": "",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3445/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "ubuntu",
          "updated_at": "2014-06-06T07:18:41"
        }, {
          "color_scheme": null,
          "hostname": "54.193.87.205",
          "id": 3447,
          "label": "dev.crystalnix.com",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3447/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "ubuntu",
          "updated_at": "2014-06-11T09:58:03"
        }, {
          "color_scheme": null,
          "hostname": "dev.crystalnix.com",
          "id": 3448,
          "label": "test",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3448/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "admin",
          "updated_at": "2014-06-16T03:43:22"
        }, {
          "color_scheme": null,
          "hostname": "dev.crystalnix.com",
          "id": 3559,
          "label": "dev.sa",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3559/",
          "ssh_key": null,
          "ssh_password": "3OVhaEwh6C5bGFb7",
          "ssh_username": "serverauditor",
          "updated_at": "2014-06-11T11:54:24"
        }, {
          "color_scheme": null,
          "hostname": "localhost",
          "id": 3560,
          "label": "",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3560/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "zhulduz",
          "updated_at": "2014-06-20T05:24:50"
        }
      ];
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
