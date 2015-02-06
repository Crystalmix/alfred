(function() {
  'use strict';
  var AlfredController;

  AlfredController = (function() {
    AlfredController.$inject = ['$scope', 'Connections', 'Histories'];

    function AlfredController(scope, Connections, Histories) {
      var hosts, _i, _len, _ref;
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
      this.scope.activities = [
        {
          "$$hashKey": "object:68",
          "hostname": "127.0.0.1",
          "id": "dcbfb663-ce0f-6f89-7b5d-a856c4fb6f0a",
          "port": 22,
          "ssh_username": "zhulduz"
        }, {
          "$$hashKey": "object:68",
          "hostname": "127.0.0.1",
          "id": "5ddb57fc-54a7-7ccf-cb09-90358fb1b146",
          "port": 22,
          "ssh_username": "zhulduz"
        }, {
          "$$hashKey": "object:68",
          "hostname": "127.0.0.1",
          "id": "2b0a199a-755a-743d-16d5-da1efdbb3dab",
          "port": 22,
          "ssh_username": "zhulduz"
        }, {
          "$$hashKey": "object:68",
          "hostname": "127.0.0.1",
          "id": "5ddb57fc-54a7-7ccf-cb09-90358fb1b146",
          "port": 22,
          "ssh_username": "zhulduz"
        }, {
          "$$hashKey": "object:68",
          "hostname": "127.0.0.1",
          "id": "7fdb50cc-54f2-6439-e048-0f39d2221120",
          "port": 22,
          "ssh_username": "zhulduz"
        }
      ];
      this.scope.hosts = [
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
        }, {
          "color_scheme": null,
          "hostname": "dev.4crystalnix.com",
          "id": 4444,
          "label": "digital",
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
          "ssh_username": "4ubuntu",
          "updated_at": "2014-06-06T07:18:41"
        }, {
          "color_scheme": null,
          "hostname": "454.193.87.205",
          "id": 4447,
          "label": "dev.crystalnix.com",
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
          "id": 4559,
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
          "id": 5560,
          "label": "",
          "port": 22,
          "resource_uri": "/api/v1/terminal/connection/3560/",
          "ssh_key": null,
          "ssh_password": "",
          "ssh_username": "zhulduz",
          "updated_at": "2014-06-20T05:24:50"
        }
      ];
      this.scope.groups = [
        {
          id: 156,
          label: "Company A",
          local_id: 1,
          parent_group: null,
          resource_uri: "/api/v2/terminal/group/156/",
          ssh_config: null,
          status: "SYNCHRONIZED",
          updated_at: "2015-02-06 02:03:38"
        }, {
          id: 157,
          label: "Production",
          local_id: 2,
          parent_group: null,
          resource_uri: "/api/v2/terminal/group/157/",
          ssh_config: null,
          status: "SYNCHRONIZED",
          updated_at: "2015-02-06 02:03:38"
        }
      ];
      this.scope.childgroups = [
        {
          id: 177,
          label: "Database",
          local_id: 3,
          parent_group: {
            id: 157,
            resource_uri: "/api/v2/terminal/group/157/",
            local_id: 2
          }
        }, {
          id: 178,
          label: "Nodes",
          local_id: 4,
          parent_group: {
            id: 157,
            resource_uri: "/api/v2/terminal/group/157/",
            local_id: 2
          }
        }
      ];
      this.scope.tags = [];
      _ref = this.scope.hosts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hosts = _ref[_i];
        this.modifiedConnection(hosts);
      }
    }

    AlfredController.prototype.modifiedConnection = function(hosts) {
      if (!hosts.label) {
        return hosts.label = "" + hosts.ssh_username + "@" + hosts.hostname;
      }
    };

    return AlfredController;

  })();

  angular.module('alfredApp').controller('AlfredController', AlfredController);

}).call(this);
