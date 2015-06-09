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

        @scope.addConnection = (parent_group) ->
            console.log "--- outerController add connection ", parent_group

        @scope.editConnection = (host) ->
            console.log "--- outerController edit connection", host

        @scope.removeConnection = (host) ->
            console.log "--- outerController remove connection", host

        @scope.uploadConnection = (connection) ->
            console.log "--- outerController upload connection", connection

        @scope.placeholder = "ssh user@hostname -p port"

        @scope.addGroup = (parent_group) ->
            console.log "--- outerController add group with current-group ", parent_group

        @scope.editGroup = (group) ->
            console.log "--- outerController edit group", group

        @scope.removeGroup = (group) ->
            console.log "--- outerController remove group", group

        @scope.query = null
        @scope.activities = []
        @scope.hosts = []
        @scope.groups = []
        @scope.taghosts = []
        @scope.tags = []
        @scope.uid = 123

        sa = new SA("https://serverauditor.com")
        sa.init().done(=>
            sa.login("zhulduz.zhankenova@crystalnix.com", "1", yes, yes)
            .done(->
                sa.sync()
            )
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
