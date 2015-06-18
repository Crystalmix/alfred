
alfredDirective.filter "filterConnections", ["$filter", "constant", ($filter, constant) ->
    (connections, query, context) ->
        scope = context

        filterFilter = $filter("filter")

        # Custom filter: filter by certain properties
        filtered = filterFilter scope.connections, (value)->
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


        #TODO this is not correct to make changes at this filter
        unless filtered[scope.selectedIndex]
            scope.selectedIndex = null

        return filtered
]
