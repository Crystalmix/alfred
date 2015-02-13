###
    The alfred directive indicates input field, determines display table or list
###
alfredDirective.directive "alfred", ["quickConnectParse", "$timeout", (quickConnectParse, $timeout) ->
    restrict: "E"
    replace: yes
    templateUrl: "src/templates/alfred.html"
    scope:
        uid: "="
        connections: "="
        histories: "="
        groups: "="
        tags: "="
        amount: "="
        heightCell: "="
        placeholder: "="
        template: "="
        onEnterCallback: "&"
        onAddCallback: "&"
        onEditCallback: "&"
        onUploadCallback: "&"
        onRemoveCallback: "&"

    controller: ($scope, $element) ->
        $scope.query = null
        $scope.selectedIndex = 0
        $scope.current_group = null

        # Prepares entities for template
        transformationData = () ->
            $scope.tags = $scope.tags.toJSON {do_not_encrypt: no}
            $scope.connections = $scope.connections.toJSON {do_not_encrypt: no}
            $scope.path_groups = if $scope.current_group then $scope.current_group.get_parent_groups($scope.current_group.get('local_id')) else []
            do $scope.path_groups.reverse

            $scope.children_group = if $scope.current_group then _.rest($scope.current_group.get_all_children($scope.current_group.get('local_id'))) else $scope.groups.get_root()

            _.each $scope.children_group, (val, key) ->
                $scope.children_group[key] = _.clone val.toJSON {do_not_encrypt: no}

            _.each $scope.path_groups, (val, key) ->
                $scope.path_groups[key] = _.clone val.toJSON {do_not_encrypt: no}

#            $scope.hosts = _.each $scope.hosts.models, (val, key) ->
#                host = val
#                $scope.hosts[key] = _.clone val.toJSON {do_not_encrypt: no}
#                $scope.hosts[key]["username"] = host.get_ssh_identity().get("username")
#            $scope.connections = $scope.hosts


        $scope.setSelectedConnection = (index) ->
            $scope.selectedIndex = index
            $scope.$broadcast "setSelectedIndex", index

        $scope.changeActiveList = () ->
            if $scope.isTable is yes and $scope.connections.length and $scope.histories.length
                $scope.isLeftActive = not $scope.isLeftActive
                $scope.isRightActive = not $scope.isRightActive
            return no

        jwerty.key '→', (->
            if $scope.isTable and $scope.histories.length
                $scope.isLeftActive = no
                $scope.isRightActive = yes
            else unless $scope.isTable is no
                return yes
        ), $element

        jwerty.key '←', (->
            if $scope.isTable and $scope.connections.length
                $scope.isLeftActive = yes
                $scope.isRightActive = no
            else unless $scope.isTable is no
                return yes
        ), $element

        jwerty.key '⇥', (->
            if $scope.isTable is yes and $scope.connections.length and $scope.histories.length
                $scope.isLeftActive = not $scope.isLeftActive
                $scope.isRightActive = not $scope.isRightActive
            return no
        ), $element

        jwerty.key '↑', (->
            $scope.$broadcast "arrow", "up"
            return no
        ), $element

        jwerty.key '↓', (->
            $scope.$broadcast "arrow", "down"
            return no
        ), $element


        jwerty.key '↩', (=>
            if $scope.query and $scope.query.indexOf("ssh") isnt -1
                connection = quickConnectParse.parse $scope.query
                @enterCallback connection
            else
                $scope.$broadcast "enter"
        ), $element


        # Binds hotkeys cmd+[1-scope.amount]
        bindHotkeysCmd = () ->
            hotkey = detectCtrlOrCmd()
            for i in [1..$scope.amount]
                jwerty.key "#{hotkey}+#{i}", (($event)->
                    $scope.$broadcast "enter", parseInt(String.fromCharCode($event.keyCode), 10) - 1
                    return no
                ), $element

        # Detects operating system in order to use correct hotkey
        detectCtrlOrCmd = () ->
            isMac = navigator.userAgent.toLowerCase().indexOf('mac') isnt -1
            hotKey = if isMac then "⌘" else "ctrl"
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
                $scope.onEnterCallback({connection: connection})

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
                $scope.isLeftActive = no
                $scope.isRightActive = yes
            else
                $scope.isLeftActive = yes
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
        do transformationData

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

        scope.$on "setFocus", (event, uid) ->
            if uid is scope.uid
                $timeout scope.setFocusAtInput

        scope.setFocusAtInput = () ->
            do $input.focus
            return no

        scope.$watch $input, () =>
            $timeout (->
                do scope.setFocusAtInput
            ), 200

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
            scope.fromHistory = 0
            scope.selectedIndex = 0

        initializeTableParameters = () ->
            scope.isTable = yes
            scope.isLeftActive = if scope.connections.length then yes else no
            scope.isRightActive = if scope.connections.length then no else yes


        scope.keydown = (event) ->
            $timeout (->
                do checkQuery
                if scope.query and scope.query.indexOf("ssh") is 0
                    scope.$broadcast "quickConnect", scope.query   # If it is quick connect we should add element with parameters to the list
                else
                    scope.$broadcast "quickConnect", null
            ), 50

        do initializeParameters
        do initializeTableParameters
]
