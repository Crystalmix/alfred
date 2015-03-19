
alfredDirective.filter "filterConnections", ["$filter", ($filter) ->
        (input, query, arg1, arg2, context) ->
            scope = context
            if scope.prevquery isnt scope.query and scope.query isnt ""
                do scope.initializeParameteres
                scope.prevquery = scope.query
            filterFilter = $filter("filter")

            # Custom filter: filter by certain properties
            scope.filteredConnections = filterFilter scope.connections, (value)->
                unless scope.query
                    return value
                else
                    isMatchLabel = (value) ->
                        if value.label
                            return value.label.indexOf(scope.query) isnt -1
                        return no

                    isMatchAddress = (value) ->
                        if value.address
                            return value.address.indexOf(scope.query) isnt -1
                        return no

                    isMatchUsername = (value) ->
                        if value.username
                            return  value.username.indexOf(scope.query) isnt -1
                        return no

                    return isMatchLabel(value) or isMatchAddress(value) or isMatchUsername(value)

            do scope.changeSlider

            return scope.filteredConnections.slice arg1, arg2
    ]
