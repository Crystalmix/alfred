'use strict';

alfredDirective = angular.module("alfredDirective", ['cfp.hotkeys'])


alfredDirective.directive "alfred", (hotkeys) ->
        restrict: "E"
        templateUrl: "partials/alfred.html"
        replace: yes
        transclude: yes
        scope:
            connections:     "="
            histories:       "="
            amount:          "="
            heightCell:      "="
            onEnterCallback: "&"
            placeholder:     "="

        controller: ($scope) ->
            $scope.query         = null
            $scope.entities      = $scope.connections.concat $scope.histories
            $scope.selectedIndex = 0

            $scope.setSelectedConnection = (index) ->
                $scope.selectedIndex = index
                $scope.$broadcast "setSelectedIndex", index

            @setSelectedIndex = (key) ->
                $scope.setSelectedConnection key

            @enterCallback = (connection) ->
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

            return @


        link: (scope, element, attrs) ->
            $input = element.find '#alfred-input'

            scope.$watch $input, () =>
                do $input.focus

            scope.$watch "isTable", () ->
                do initializeParameters

            hotkeys.bindTo(scope)
                .add({
                    combo: 'return'
                    description: 'Make active left list'
                    allowIn: ['INPUT']
                    callback: ($event) ->
                        do $event.preventDefault
                        scope.$broadcast "enter"
                })
                .add({
                    combo: 'left'
                    description: 'Make active left list'
                    allowIn: ['INPUT']
                    callback: ($event) ->
                        do $event.preventDefault
                        scope.isLeftActive  = yes
                        scope.isRightActive = no
                })
                .add({
                    combo: 'right'
                    description: 'Make active right list'
                    allowIn: ['INPUT']
                    callback: ($event) ->
                        do $event.preventDefault
                        scope.isLeftActive  = no
                        scope.isRightActive = yes
                })
                .add({
                    combo: 'up'
                    description: 'Make active element above'
                    allowIn: ['INPUT']
                    callback: ($event) ->
                        do $event.preventDefault
                        scope.$broadcast "arrow", "up"
                })
                .add({
                    combo: 'down'
                    description: 'Make active element above'
                    allowIn: ['INPUT']
                    callback: ($event) ->
                        do $event.preventDefault
                        scope.$broadcast "arrow", "down"
                })


            bindHotkeysCmd = () ->
                cmd = do detectCtrlOrCmd
                for i in [1..scope.amount]
                    combo = "#{cmd}+#{i}"
                    hotkeys.bindTo(scope)
                        .add({
                            combo: combo
                            description: 'Cmd+i'
                            allowIn: ['INPUT']
                            callback: ($event) ->
                                do $event.preventDefault
                                scope.setSelectedConnection(parseInt(String.fromCharCode($event.keyCode)) - 1)
                                scope.$broadcast "enter"
                        })


            detectCtrlOrCmd = () ->
                isMac = navigator.userAgent.toLowerCase().indexOf('mac') isnt -1
                hotKey = if isMac then 'command' else 'ctrl'
                hotKey


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
                scope.isLeftActive  = yes
                scope.isRightActive = no


            scope.keydown = ($event) ->
                setTimeout (->
                    do checkQuery
                ), 0


            do initializeParameters
            do initializeTableParameters
            do bindHotkeysCmd


alfredDirective.directive "inactiveList",  () ->
        require: "^alfred"
        restrict: "AE"
        templateUrl: "partials/inactive-connections.html"
        scope:
            connections:   "="
            amount:        "="
            heightCell:    "="
            from:          "="

        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'

            $scope.changeOffset = () ->
                $scope.offset = $scope.from + $scope.amount

        link: (scope, element, attrs, alfredCtrl) ->
            do scope.changeOffset

            element.bind "mouseenter", () ->
                do alfredCtrl.changeActiveList


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
            connections:   "="
            amount:        "="
            heightCell:    "="
            query:         "="
            from:          "="
            selectedIndex: "="

        # subConnetions is a visible array
        controller: ($scope) ->
            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'

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

            @select = (key) ->
                $scope.setSelectedConnection key
                do $scope.$apply

            do $scope.changeOffset

            return @


        link: (scope, element, attrs, alfredCtrl) ->
            scope.alfredController = alfredCtrl
            scope.prevquery = null

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
                console.log scope.selectedIndex
                connection = scope.subConnections[key]
                scope.select connection, key
            )

            activateNextItem = () ->
                current = element.find(".active")
                next = current.next()
                currentIndex = scope.getSelectedConnection()
                if next.length is 0
                    do scope.loadDown
                    setTimeout (->
                        next = current.next()
                        if next.length is 0
                            scope.from   = 0
                            scope.offset = scope.amount
                            scope.setSelectedConnection(0)
                            scope.$apply()
                    ), 100
                else
                    scope.setSelectedConnection(++currentIndex)

            activatePreviousItem = () ->
                current = element.find(".active")
                prev = current.prev()
                currentIndex = scope.getSelectedConnection()
                if prev.length is 0
                    do scope.loadUp
                    setTimeout (->
                        prev = current.prev()
                        if prev.length is 0
                            from = scope.filteredConnections.length - scope.amount
                            if from > 0
                                scope.from   = from
                                scope.offset = scope.filteredConnections.length - 1
                                scope.setSelectedConnection(scope.amount - 1)
                            else
                                scope.setSelectedConnection(scope.filteredConnections.length - 1)
                            scope.$apply()
                    ), 100
                else
                    scope.setSelectedConnection(--currentIndex)


alfredDirective.directive "connectionItem",  () ->
        restrict: "A"
        require: "^activeList"

        link: (scope, element, attrs, connectionListCtrl) ->
            element.bind "mouseenter", () ->
                connectionListCtrl.select scope.key


alfredDirective.filter "filterConnections", ["$filter", ($filter) ->
        (input, query, arg1, arg2) ->
            scope = this
            if scope.prevquery isnt scope.query and scope.query isnt ""
                do scope.initializeParameteres
                scope.prevquery = scope.query
            filterFilter = $filter("filter")
            scope.filteredConnections = filterFilter scope.connections, scope.query
            return scope.filteredConnections.slice arg1, arg2
    ]
