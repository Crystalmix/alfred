'use strict';

class AlfredController

    @$inject: ['$scope', 'Connections', 'Histories']

    constructor: (@scope, @Connections, @Histories) ->
        @scope.histories   = @Histories.query()

        @Connections.query {},
                            (response) =>
                                @scope.connections = response
                                @modifiedConnection connection for connection in @scope.connections

        ###
        numbers = new Bloodhound({
            datumTokenizer: (d) ->
                 return Bloodhound.tokenizers.whitespace(d.label)
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            local: [
                {
                  label: "digital"
                },
                {
                  label: "ubuntu@54.193.87.205"
                },
                {
                  label: "dev.crystalnix.com"
                },
                {
                  label: "test"
                },
                {
                  label: "dev.sa"
                },
                {
                  label: "zhulduz@localhost"
                }
            ]
        })

        numbers.initialize();

        @scope.connections = {
            displayKey: 'label',
            source: numbers.ttAdapter()
        };
        @scope.exampleOptions =
            editable: false
        ###

        @scope.entities = @scope.connections
        @scope.query = null


    modifiedConnection: (connection) ->
        if not connection.label
            connection.label = "#{connection.ssh_username}@#{connection.hostname}"

angular.module('alfredApp').controller 'AlfredController', AlfredController
