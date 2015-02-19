'use strict';

class AlfredController

    @$inject: ['$scope', 'Connections', 'Histories']

    constructor: (@scope, @Connections, @Histories) ->

        ###@Histories.query {},(response) =>
                                @scope.histories = response
        @Connections.query {}, (response) =>
                                @scope.connections = response
                                #@modifiedConnection connection for connection in @scope.connections

        ###
        @scope.enterConnection = (connection) ->
            console.log "--- outerController", connection

        @scope.addConnection = () ->
            console.log "--- outerController add connection"

        @scope.editConnection = (connection) ->
            console.log "--- outerController edit connection", connection

        @scope.uploadConnection = (connection) ->
            console.log "--- outerController upload connection", connection

        @scope.removeConnection = (connection) ->
            console.log "--- outerController remove connection", connection

        @scope.placeholder = "ssh user@hostname -p port"

        @scope.query = null
        @scope.activities = []
        @scope.hosts = []
        @scope.groups = []
        @scope.taghosts = []
        @scope.tags = []

        sa = new SA("https://serverauditor.com")
        sa.init().done(=>
            sa.auth("zhulduz.zhankenova@crystalnix.com","1")
        )
        sa.on(sa.event_names.MERGED_FULL_SYNC, () => # if AUTH_REMOTE_SUCCESS then the synchronization will be started
            @scope.hosts = sa.hosts
            @scope.groups = sa.groups
            @scope.taghosts = sa.taghosts
            @scope.tags = sa.tags
            @scope.activities = sa.activities
            @scope.showAlfred = yes
            do @scope.$apply
        )

angular.module('alfredApp').controller 'AlfredController', AlfredController
