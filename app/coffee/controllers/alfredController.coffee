'use strict';

class AlfredController

    @$inject: ['$scope', 'Connections', 'Histories']

    constructor: (@scope, @Connections, @Histories) ->
        @scope.histories   = @Histories.query()
        @scope.connections = @Connections.query()
        @scope.isTable = yes

        @scope.entities = @scope.connections;


angular.module('alfredApp').controller 'AlfredController', AlfredController
