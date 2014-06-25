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


    modifiedConnection: (connection) ->
        if not connection.label
            connection.label = "#{connection.ssh_username}@#{connection.hostname}"

angular.module('alfredApp').controller 'AlfredController', AlfredController
