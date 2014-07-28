
alfredDirective.directive "alfred", ['hotkeys', 'quickConnectParse', (hotkeys, quickConnectParse) ->
        restrict: "E"
        templateUrl: "/src/templates/alfred.html"
        replace: yes
        scope:
            connections:        "="
            histories:          "="
            amount:             "="
            heightCell:         "="
            placeholder:        "="
            onEnterCallback:    "&"
            onAddCallback:      "&"
            onEditCallback:     "&"
            onRemoveCallback:   "&"

        controller: ($scope) ->
            ###
                "alfred" directive scope conatin next parameters:
                    1. "isTable" - switch table/list
                    2. "SelectedItem" - selected item is constant
            ###
            $scope.query         = null
            $scope.entities      = $scope.connections.concat $scope.histories
            $scope.selectedIndex = 0

            $scope.setSelectedConnection = (index) ->
                $scope.selectedIndex = index
                $scope.$broadcast "setSelectedIndex", index

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
                    combo: 'left'
                    description: 'Make active left list'
                    allowIn: ['INPUT']
                    callback: () ->
                        if $scope.connections.length
                            $scope.isLeftActive  = yes
                            $scope.isRightActive = no
                })
                .add({
                    combo: 'right'
                    description: 'Make active right list'
                    allowIn: ['INPUT']
                    callback: () ->
                        if $scope.histories.length
                            $scope.isLeftActive  = no
                            $scope.isRightActive = yes
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
                                $scope.setSelectedConnection(parseInt(String.fromCharCode($event.keyCode)) - 1)
                                $scope.$broadcast "enter"
                        })

            detectCtrlOrCmd = () ->
                isMac = navigator.userAgent.toLowerCase().indexOf('mac') isnt -1
                hotKey = if isMac then 'command' else 'ctrl'
                hotKey

            @setSelectedIndex = (key) ->
                $scope.setSelectedConnection key

            @enterCallback = (connection) ->
                if connection
                    $scope.onEnterCallback({connection:connection})

            @changeFromProperty = (from) ->
                if $scope.isTable
                    if $scope.isLeftActive
                        $scope.fromConnection = from
                    else
                        $scope.fromHistory = from

            @changeActiveList = () ->
                if $scope.isLeftActive
                    $scope.isLeftActive  = no
                    $scope.isRightActive = yes
                else
                    $scope.isLeftActive  = yes
                    $scope.isRightActive = no
                do $scope.$apply

            @edit = (connection) ->
                if connection
                    $scope.onEditCallback({connection: connection})

            @remove = (connection) ->
                if connection
                    $scope.onRemoveCallback({connection: connection})

            $scope.cmdSystemHotkey = do detectCtrlOrCmd
            do bindHotkeysCmd

            return @


        link: (scope, element) ->
            $input = element.find '#alfred-input'

            scope.$watch $input, () =>
                do $input.focus

            scope.$watch "isTable", () ->
                do initializeParameters

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

            makeRestLists = () ->
                ###
                If one of the lists is empty or maximum/minimum length of lists is smaller than amount,
                we should fill out list with empty cell
                ###
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
                ), 0

            scope.addConnection = () ->
                do scope.onAddCallback

            do initializeParameters
            do initializeTableParameters
            do makeRestLists

]
