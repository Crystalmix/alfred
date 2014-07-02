'use strict';

describe('FilterConnections Test', function() {
    var $rootScope,
        scope,
        filterConnections,
        connectionsArray = [
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
                                  "ssh_username": "1. ubuntu",
                                  "updated_at": "2014-06-06T07:18:41"
                            },
                            {
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
                            },
                            {
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
                            }
                        ];

    beforeEach(module('alfredDirective'));
    beforeEach(inject(
        function(_$rootScope_, filterConnectionsFilter){
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            filterConnections = filterConnectionsFilter;
        })
    );

    it('should replace VERSION',
        function() {
            var result = [
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
                }
            ]
            scope.prevquery = scope.query = null;
            scope.connections = connectionsArray;
            expect(filterConnections([], scope, 0, 1)).toEqual(result);
        }
    );
});

