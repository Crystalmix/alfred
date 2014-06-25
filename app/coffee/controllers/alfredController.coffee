'use strict';

class AlfredController

    @$inject: ['$scope', 'Connections', 'Histories']

    constructor: (@scope, @Connections, @Histories) ->
        @scope.histories   = @Histories.query()
        @Connections.query {},
                            (response) =>
                                @scope.connections = response
                                @modifiedConnection connection for connection in @scope.connections
        @scope.query = null
        @scope.connections = [
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
            },
            {
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
            },
            {
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
            },
            {
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
            },
            {
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
            },
            {
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
        ]


    modifiedConnection: (connection) ->
        if not connection.label
            connection.label = "#{connection.ssh_username}@#{connection.hostname}"

angular.module('alfredApp').controller 'AlfredController', AlfredController
