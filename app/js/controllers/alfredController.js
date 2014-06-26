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
          "label": "0. digital",
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
          "ssh_username": "1. ubuntu",
          "updated_at": "2014-06-06T07:18:41"
        }, {
          "color_scheme": null,
          "hostname": "54.193.87.205",
          "id": 3447,
          "label": "2. dev.crystalnix.com",
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
          "label": "3. test",
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
          "label": "4. dev.sa",
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
          "ssh_username": "5. zhulduz",
          "updated_at": "2014-06-20T05:24:50"
        }, {
          "color_scheme": null,
          "hostname": "dev.4crystalnix.com",
          "id": 4444,
          "label": "6. digital",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3444/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "4serverauditor",
          "updated_at": "2014-06-20T05:24:31"
        }, {
          "color_scheme": null,
          "hostname": "454.193.87.205",
          "id": 4445,
          "label": "",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3445/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "7. 4ubuntu",
          "updated_at": "2014-06-06T07:18:41"
        }, {
          "color_scheme": null,
          "hostname": "454.193.87.205",
          "id": 4447,
          "label": "8. dev.crystalnix.com",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3447/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "ubuntu",
          "updated_at": "2014-06-11T09:58:03"
        }, {
          "color_scheme": null,
          "hostname": "dev.8crystalnix.com",
          "id": 4448,
          "label": "9. test",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3448/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "admin",
          "updated_at": "2014-06-16T03:43:22"
        }, {
          "color_scheme": null,
          "hostname": "dev.crystalnix.com",
          "id": 4559,
          "label": "10. dev.sa",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3559/",
          "ssh_key": null,
          "ssh_password": "3OVhaEwh6C5bGFb7",
          "ssh_username": "serverauditor",
          "updated_at": "2014-06-11T11:54:24"
        }, {
          "color_scheme": null,
          "hostname": "localhost",
          "id": 5560,
          "label": "",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3560/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "11. zhulduz",
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
