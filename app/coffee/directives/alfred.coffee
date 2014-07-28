'use strict';


alfredDirective = angular.module("alfredDirective", ['cfp.hotkeys'])


alfredDirective.config (hotkeysProvider) ->
    ###
        'hotkeysProvider' is provider from angular.hotkeys.

        Switch default cheatsheet: hotkey '?'
    ###
    hotkeysProvider.includeCheatSheet = yes


alfredDirective.factory 'quickConnectParse', () ->
    ###
        A hepler service that can parse quick connect parameters
        Possible cases:
                ssh               user@host
                ssh               user@host   -p port
                ssh               user@host   -pport

                ssh    -p port    user@host
                ssh    -pport     user@host
    ###
    trimArray = (array) ->
        for i in [0...array.length]
            array[i] = $.trim(array[i])
        return array;

    parse : (input) ->
        options = {}
        if input.indexOf('ssh') isnt -1
            inputArray = input.split('ssh')
            if inputArray.length is 2 and inputArray[0] is ""
                input = inputArray[1].trim()
                if input and input.length > 2
                    inputArray = _.compact(input.split("@"))
                    if inputArray.length is 2
                        leftInputArray  = inputArray[0].trim()
                        rightInputArray = inputArray[1].trim()
                        leftInputArray  = trimArray(_.compact(leftInputArray.split(" ")))
                        rightInputArray = trimArray(_.compact(rightInputArray.split(" ")))

                        if leftInputArray.length >= 2 and leftInputArray.indexOf('-p') isnt -1
                            if leftInputArray.length is 3 and leftInputArray[0] is "-p"
                                options.port = parseInt(leftInputArray[1])
                            else if leftInputArray.length is 2 and leftInputArray[0].indexOf('-p') is 0
                                options.port = parseInt(leftInputArray[0].slice(2))
                            else
                                return {}
                        else if leftInputArray.length >= 2 and leftInputArray.indexOf('-p') is -1
                            return {}
                        options.ssh_username = leftInputArray[leftInputArray.length - 1]

                        if rightInputArray.length >=2 and rightInputArray.indexOf("-p") isnt -1
                            if rightInputArray.length is 2 and rightInputArray[1].indexOf("-p") is 0
                                options.port = parseInt(rightInputArray[1].slice(2))
                            else if rightInputArray.length is 3 and rightInputArray[1] is "-p"
                                options.port = parseInt(rightInputArray[2])
                            else
                                return {}
                        else if rightInputArray.length >=2 and rightInputArray.indexOf("-p") is -1
                            return {}
                        options.hostname = rightInputArray[0]
                        if not options.port
                            options.port = 22

                        return options
        return {}


alfredDirective.directive "alfred", ['hotkeys', 'quickConnectParse', (hotkeys, quickConnectParse) ->
        restrict: "E"
        templateUrl: "partials/alfred.html"
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

alfredDirective.directive "inactiveList",  () ->
        require: "^alfred"
        restrict: "AE"
        templateUrl: "partials/inactive-connections.html"
        scope:
            connections:   "="
            amount:        "="
            heightCell:    "="
            from:          "="
            rest: "="

        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'

            $scope.setSizerHeight = () ->
                height: ($scope.from * 100) / $scope.connections.length + '%'

            $scope.setSliderHeight = () ->
                height: ($scope.amount * 100) / $scope.connections.length + '%'

            $scope.changeOffset = () ->
                $scope.offset = $scope.from + $scope.amount

        link: (scope, element, attrs, alfredCtrl) ->
            do scope.changeOffset

            element.bind "mouseenter", () ->
                if scope.connections.length
                    do alfredCtrl.changeActiveList

            scope._normalizeSliderHeight = (sliderHeight, sizerHeight) ->
                if sizerHeight > 100 - sliderHeight
                    sizerHeight = 100 - sliderHeight
                if  sliderHeight > 100
                    sliderHeight = 100
                sliderHeight *= 100;
                sizerHeight *= 100;
                sizerHeight = Math.floor(sizerHeight) / 100
                sliderHeight = Math.ceil(sliderHeight) / 100

                return {sliderHeight: sliderHeight, sizerHeight: sizerHeight}

            scope.changeSlider = () ->
                slider = (scope.amount * 100) / scope.filteredConnections.length
                sizer = (scope.from * 100) / scope.filteredConnections.length
                sizes = scope._normalizeSliderHeight(slider, sizer)
                scope.slider = sizes.sliderHeight
                scope.sizer = sizes.sizerHeight


alfredDirective.directive "activeList",  () ->
        ###
            connections         --  array of all hosts
            filteredConnections --  array of queried hosts
            subConnections      --  array of visible hosts
        ###
        require: "^alfred"
        restrict: "AE"
        templateUrl: "partials/active-connections.html"
        scope:
            connections:     "="
            amount:          "="
            heightCell:      "="
            query:           "="
            from:            "="
            selectedIndex:   "="
            cmdSystemHotkey: "="
            rest: "="

        # subConnetions is a visible array
        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'

            $scope.setSizerHeight = () ->
                height: $scope.sizer + '%'

            $scope.setSliderHeight = () ->
                height: $scope.slider + '%'

            $scope.changeOffset = () ->
                $scope.offset = $scope.from + $scope.amount

            $scope.initializeParameteres = () ->
                $scope.from = 0
                $scope.setSelectedConnection 0

            $scope.select = (connection, key) ->
                $scope.setSelectedConnection key
                $scope.alfredController.enterCallback connection

            $scope.setSelectedConnection = (index) ->
                $scope.selectedIndex = index

            $scope.getSelectedConnection = () ->
                $scope.selectedIndex

            $scope.loadUp = () ->
                if $scope.filteredConnections[$scope.from-1]
                    --$scope.from
                    --$scope.offset

            $scope.loadDown = () ->
                if $scope.filteredConnections[$scope.offset]
                    ++$scope.from
                    ++$scope.offset

            ###*
            * Checking history entity
            ###
            $scope.isHistory = (connection) ->
                if connection.id?
                    return no
                return yes

            @select = (key) ->
                $scope.setSelectedConnection key
                do $scope.$apply

            do $scope.changeOffset

            return @


        link: (scope, element, attrs, alfredCtrl) ->
            # Check if list length is more than amount of cells
            scope.selectedIndex = if scope.selectedIndex >= scope.connections.length then (scope.connections.length-1) else scope.selectedIndex

            scope.alfredController = alfredCtrl
            scope.prevquery = null

            # Template icons
            scope.enterText = '↩'
            scope.cmdSystemHotkey = if scope.cmdSystemHotkey is "command" then "⌘" else "Ctrl"

            scope.$watch "selectedIndex", (key) ->
                alfredCtrl.setSelectedIndex(key)

            scope.$watch "from", (from) ->
                scope.offset = scope.from + scope.amount
                alfredCtrl.changeFromProperty(from)

            scope.$on('arrow', (event, orientation) ->
                if orientation is 'up'
                    do activatePreviousItem
                else
                    do activateNextItem
            )

            scope.$on('setSelectedIndex', (event, key) ->
                scope.selectedIndex = key
            )

            scope.$on('enter', () ->
                key = scope.getSelectedConnection()
                connection = scope.subConnections[key]
                scope.select connection, key
            )

            scope.edit = ($event, connection) ->
                do $event.preventDefault
                do $event.stopPropagation
                alfredCtrl.edit(connection)

            scope.remove = ($event, connection) ->
                do $event.preventDefault
                do $event.stopPropagation
                alfredCtrl.remove(connection)

            scope.changeSlider = () ->
                slider = (scope.amount * 100) / scope.filteredConnections.length
                sizer = (scope.from * 100) / scope.filteredConnections.length
                sizes = scope._normalizeSliderHeight(slider, sizer)
                scope.slider = sizes.sliderHeight
                scope.sizer = sizes.sizerHeight

            scope._normalizeSliderHeight = (sliderHeight, sizerHeight) ->
                if sizerHeight > 100 - sliderHeight
                    sizerHeight = 100 - sliderHeight
                if  sliderHeight > 100
                    sliderHeight = 100
                sliderHeight *= 100;
                sizerHeight *= 100;
                sizerHeight = Math.floor(sizerHeight) / 100;
                sliderHeight = Math.ceil(sliderHeight) / 100;

                return {sliderHeight: sliderHeight, sizerHeight: sizerHeight};

            activateNextItem = () ->
                current = element.find(".active")
                next = current.next()
                currentIndex = scope.getSelectedConnection()
                if next.length is 0 or not next[0].id
                    do scope.loadDown
                    setTimeout (->
                        next = current.next()
                        if next.length is 0 or not next[0].id
                            scope.from   = 0
                            scope.offset = scope.amount
                            scope.setSelectedConnection(0)
                            scope.$apply()
                    ), 0
                else
                    scope.setSelectedConnection(++currentIndex)

            activatePreviousItem = () ->
                current = element.find(".active")
                prev = current.prev()
                currentIndex = scope.getSelectedConnection()
                if prev.length is 0 or not prev[0].id
                    do scope.loadUp
                    setTimeout (->
                        prev = current.prev()
                        if prev.length is 0 or not prev[0].id
                            from = scope.filteredConnections.length - scope.amount
                            if from > 0
                                scope.from   = from
                                scope.offset = scope.filteredConnections.length - 1
                                scope.setSelectedConnection(scope.amount - 1)
                            else
                                scope.setSelectedConnection(scope.filteredConnections.length - 1)
                            scope.$apply()
                    ), 0
                else
                    scope.setSelectedConnection(--currentIndex)


alfredDirective.directive "connectionItem",  () ->
        restrict: "A"
        require: "^activeList"

        link: (scope, element, attrs, connectionListCtrl) ->
            element.bind "mouseenter", () ->
                connectionListCtrl.select scope.key


alfredDirective.directive('whenScrolled', () ->
        restrict: 'A'

        link: (scope, element) ->

            element.bind('mousewheel', (event) ->
                if(event.originalEvent.wheelDelta < 0)
                    scope.$apply scope.loadDown
                else
                    scope.$apply scope.loadUp
                event.preventDefault();
            )
)

alfredDirective.filter "filterConnections", ["$filter", ($filter) ->
        (input, query, arg1, arg2) ->
            scope = this
            if scope.prevquery isnt scope.query and scope.query isnt ""
                do scope.initializeParameteres
                scope.prevquery = scope.query
            filterFilter = $filter("filter")
            scope.filteredConnections = filterFilter scope.connections, scope.query

            do scope.changeSlider

            return scope.filteredConnections.slice arg1, arg2
    ]
