
alfredDirective.filter "filterConnections", ["$filter", "constant", ($filter, constant) ->
        (input, query, context) ->
            scope = context
            if scope.prevquery isnt scope.query and scope.query isnt ""
                do scope.initializeParameteres
                scope.prevquery = scope.query
            filterFilter = $filter("filter")

            # Custom filter: filter by certain properties
            return filterFilter scope.connections, (value)->
                unless scope.query
                    return value
                else
                    isMatchLabel = (value) ->
                        if value["#{constant.host.label}"]
                            return value["#{constant.host.label}"].indexOf(scope.query) isnt -1
                        return no

                    isMatchAddress = (value) ->
                        if value["#{constant.host.address}"]
                            return value["#{constant.host.address}"].indexOf(scope.query) isnt -1
                        return no

                    isMatchUsername = (value) ->
                        if value["#{constant.host.username}"]
                            return  value["#{constant.host.username}"].indexOf(scope.query) isnt -1
                        return no

                    return isMatchLabel(value) or isMatchAddress(value) or isMatchUsername(value)

    ]
