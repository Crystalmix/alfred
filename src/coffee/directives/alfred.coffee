
###
    The alfred directive indicates input field, determines display table or list
###
alfredDirective.directive "alfred", ['hotkeys', 'quickConnectParse', (hotkeys, quickConnectParse) ->
        restrict: "E"
        replace: yes
        templateUrl: "src/templates/alfred.html"
        scope:
            connections:        "="
            histories:          "="
            amount:             "="
            heightCell:         "="
            placeholder:        "="
            onEnterCallback:    "&"
            onAddCallback:      "&"
            onEditCallback:     "&"
            onUploadCallback:   "&"
            onRemoveCallback:   "&"

        controller: ($scope, $element) ->
            $scope.query         = null
            $scope.entities      = $scope.connections.concat $scope.histories
            $scope.selectedIndex = 0

            $scope.setSelectedConnection = (index) ->
                $scope.selectedIndex = index
                $scope.$broadcast "setSelectedIndex", index

            $scope.listener = new keypress.Listener($element[0], {
                is_unordered: true,
                prevent_repeat: true
            })

            $scope.listener.simple_combo ['left'], =>
                if $scope.connections.length
                    $scope.isLeftActive  = yes
                    $scope.isRightActive = no

            $scope.listener.simple_combo ['right'], =>
                if $scope.connections.length
                    $scope.isLeftActive  = no
                    $scope.isRightActive = yes

            # Binds hotkeys to the scope
            hotkeys.bindTo($scope)
                .add({
                    combo: 'return'
                    description: 'Make active left list'
                    allowIn: ['INPUT']
                    callback: () =>
                        if $scope.query and $scope.query.indexOf("ssh") isnt -1
                            connection = quickConnectParse.parse $scope.query
                            @enterCallback connection
                        else
                            $scope.$broadcast "enter"
                })
                .add({
                    combo: 'up'
                    description: 'Make active element above'
                    allowIn: ['INPUT']
                    callback: ($event) ->
                        do $event.preventDefault
                        $scope.$broadcast "arrow", "up"
                })
                .add({
                    combo: 'down'
                    description: 'Make active element above'
                    allowIn: ['INPUT']
                    callback: ($event) ->
                        do $event.preventDefault
                        $scope.$broadcast "arrow", "down"
                })

            # Binds hotkeys cmd+[1-scope.amount]
            bindHotkeysCmd = () ->
                for i in [1..$scope.amount]
                    combo = "#{$scope.cmdSystemHotkey}+#{i}"
                    hotkeys.bindTo($scope)
                        .add({
                            combo: combo
                            description: 'Make active element ' + (i+1)
                            allowIn: ['INPUT']
                            callback: ($event) ->
                                do $event.preventDefault
                                #$scope.setSelectedConnection(parseInt(String.fromCharCode($event.keyCode)) - 1)
                                $scope.$broadcast "enter", parseInt(String.fromCharCode($event.keyCode), 10) - 1
                        })

            # Detects operating system in order to use correct hotkey
            detectCtrlOrCmd = () ->
                isMac = navigator.userAgent.toLowerCase().indexOf('mac') isnt -1
                hotKey = if isMac then 'command' else 'ctrl'
                hotKey

            ###
                Methods are api between alfred directive and child directives
            ###

            # Sets seleceted item
            #
            # @param key    index within [1-scope.amount]
            @setSelectedIndex = (key) ->
                $scope.setSelectedConnection key

            # Calls callback function on event 'enter'
            #
            # @param connection    json-object
            @enterCallback = (connection) ->
                if connection
                    $scope.onEnterCallback({connection:connection})

            # Saves paramaters: fromConnection, fromHistories
            @changeFromProperty = (from) ->
                if $scope.isTable
                    if $scope.isLeftActive
                        $scope.fromConnection = from
                    else
                        $scope.fromHistory = from

            # Changes active list on hotkeys
            @changeActiveList = () ->
                if $scope.isLeftActive
                    $scope.isLeftActive  = no
                    $scope.isRightActive = yes
                else
                    $scope.isLeftActive  = yes
                    $scope.isRightActive = no
                do $scope.$apply

            # Calls callback function on event 'edit'
            #
            # @param connection    json-object
            @edit = (connection) ->
                if connection
                    $scope.onEditCallback({connection: connection})

            # Calls callback function on event 'upload'
            #
            # @param connection    json-object
            @upload = (connection) ->
                if connection
                    $scope.onUploadCallback({connection: connection})

            # Calls callback function on event 'remove'
            #
            # @param connection    json-object
            @remove = (connection) ->
                if connection
                    $scope.onRemoveCallback({connection: connection})

            # Calls callback function on event 'add'
            $scope.addConnection = () ->
                do $scope.onAddCallback

            $scope.cmdSystemHotkey = do detectCtrlOrCmd
            do bindHotkeysCmd

            return @


        link: (scope, element, attrs) ->
            $input = element.find '#alfred-input'

            # If not define attrs, we should trigger jQuery events
            if not angular.isDefined(attrs.onEnterCallback)
                scope.onEnterCallback = (connection) ->
                    $input.trigger "onEnterCallback", connection.connection
                    return no

            if not angular.isDefined(attrs.onAddCallback)
                scope.onAddCallback = () ->
                    $input.trigger "onAddCallback"
                    return no

            if not angular.isDefined(attrs.onEditCallback)
                scope.onEditCallback = (connection) ->
                    $input.trigger "onEditCallback", connection.connection
                    return no

            if not angular.isDefined(attrs.onUploadCallback)
                scope.onUploadCallback = (connection) ->
                    $input.trigger "onUploadCallback", connection.connection
                    return no

            if not angular.isDefined(attrs.onRemoveCallback)
                scope.onRemoveCallback = (connection) ->
                    $input.trigger "onRemoveCallback", connection.connection
                    return no

            scope.$watch $input, () =>
                do $input.focus

            scope.$watch "isTable", () ->
                do initializeParameters

            # Checks query in order to switch/switch off table state
            checkQuery = () ->
                if scope.query
                    scope.isTable = no
                else
                    scope.isTable = yes
                do scope.$apply

            initializeParameters = () ->
                scope.fromConnection = 0
                scope.fromHistory    = 0
                scope.selectedIndex  = 0

            initializeTableParameters = () ->
                scope.isTable       = yes
                scope.isLeftActive  = if scope.connections.length then yes else no
                scope.isRightActive = if scope.connections.length then no else yes

            # Adds empty cells to the lists if it is needed
            #
            # If one of the lists is empty or maximum/minimum length of lists is smaller than amount,
            # we should fill out list with empty cell
            makeRestLists = () ->
                minLength = if scope.connections.length < scope.histories.length then scope.connections.length else scope.histories.length

                if minLength < scope.amount
                    maxLength = if scope.connections.length > scope.histories.length then scope.connections.length else scope.histories.length
                    if maxLength is 0
                        return
                    else if maxLength < scope.amount
                        if scope.connections.length < scope.histories.length
                            scope.restOfConnections = new Array(maxLength - minLength)
                            scope.restOfHistories   = new Array 0
                        else
                            scope.restOfConnections = new Array 0
                            scope.restOfHistories   = new Array(maxLength - minLength)
                    else
                        if scope.connections.length < scope.histories.length
                            scope.restOfConnections = new Array(scope.amount - minLength)
                            scope.restOfHistories   = new Array 0
                        else
                            scope.restOfConnections = new Array 0
                            scope.restOfHistories   = new Array(scope.amount - minLength)


            scope.keydown = () ->
                setTimeout (->
                    do checkQuery
                    if scope.query and scope.query.indexOf("ssh") is 0
                        scope.$broadcast "quickConnect" , scope.query   # If it is quick connect we should add element with parameters to the list
                    else
                        scope.$broadcast "quickConnect" , null
                ), 50


            do initializeParameters
            do initializeTableParameters
            do makeRestLists

]
