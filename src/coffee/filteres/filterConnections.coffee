
alfredDirective.filter "filterConnections", ["$filter", ($filter) ->
        (input, query, arg1, arg2, context) ->
            scope = context
            if scope.prevquery isnt scope.query and scope.query isnt ""
                do scope.initializeParameteres
                scope.prevquery = scope.query
            filterFilter = $filter("filter")
            scope.filteredConnections = filterFilter scope.connections, scope.query

            do scope.changeSlider

            return scope.filteredConnections.slice arg1, arg2
    ]