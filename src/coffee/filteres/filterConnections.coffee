
alfredDirective.filter "filterConnections", ["$filter", ($filter) ->
        (input, query, arg1, arg2, context) ->
            scope = context
            if scope.prevquery isnt scope.query and scope.query isnt ""
                do scope.initializeParameteres
                scope.prevquery = scope.query
            filterFilter = $filter("filter")

#            scope.filteredConnections = filterFilter scope.connections, scope.query

            # Custom filter: filter by certain properties
            scope.filteredConnections = filterFilter scope.connections, (value, index)->
                unless scope.query
                    return value
                else
                    isMatchLabel = (value) ->
                        if value.label
                            return value.label.indexOf(scope.query) isnt -1
                        return no

                    isMatchHostname = (value) ->
                        if value.hostname
                            return value.hostname.indexOf(scope.query) isnt -1
                        return no

                    isMatchUsername = (value) ->
                        if value.ssh_username
                            return  value.ssh_username.indexOf(scope.query) isnt -1
                        return no

                    return isMatchLabel(value) or isMatchHostname(value) or isMatchUsername(value)

            do scope.changeSlider

            return scope.filteredConnections.slice arg1, arg2
    ]
