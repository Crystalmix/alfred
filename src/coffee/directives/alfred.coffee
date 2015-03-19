###
    The alfred directive indicates input field, determines display table or list
###
alfredDirective.directive "alfred", ["quickConnectParse", "$timeout", (quickConnectParse, $timeout) ->
    restrict: "E"
    replace: yes
    templateUrl: "src/templates/alfred.html"
    scope:
        uid: "="
        hosts: "="
        activities: "="
        groups: "="
        taghosts: "="
        tags: "="
        amount: "="
        heightCell: "="
        placeholder: "="
        template: "="

        onEnterHostCallback: "&"
        onAddHostCallback: "&"
        onEditHostCallback: "&"
        onRemoveHostCallback: "&"

        onAddGroupCallback: "&"
        onEditGroupCallback: "&"
        onRemoveGroupCallback: "&"

    controller: ($scope, $element) ->
        $scope.query = null
        $scope.selectedIndex = 0
        $scope.current_group = null
        $scope.chosen_tags = []

        getGroups = () ->
            current_group_id = if $scope.current_group then $scope.current_group.get('local_id') else null

            $scope.path_groups = if current_group_id then $scope.groups.get_parent_groups(current_group_id) else []
            do $scope.path_groups.reverse

            $scope.children_group = if current_group_id then _.rest($scope.groups.get_all_children(current_group_id)) else $scope.groups.get_root()

            _.each $scope.children_group, (val, key) ->
                $scope.children_group[key] = _.clone val.toJSON {do_not_encrypt: no}

            _.each $scope.path_groups, (val, key) ->
                $scope.path_groups[key] = _.clone val.toJSON {do_not_encrypt: no}


        filter_hosts_by_chosen_tags = () ->
            tag_hosts = []
            array_id_of_hosts = []
            array_of_local_id_of_tags = []

            _.each $scope.chosen_tags, (val) ->
                array_of_local_id_of_tags = _.union array_of_local_id_of_tags, val.local_id

            tag_hosts = $scope.taghosts.intersection_by_tags(array_of_local_id_of_tags)

            # Gets host.local_id from tag_hosts
            _.each tag_hosts, (val) ->
                if val.get("host").local_id
                    array_id_of_hosts = _.union array_id_of_hosts, val.get("host").local_id

            # Merges connections 
            if tag_hosts.length
                $scope.connections = _.filter $scope.connections, (val) ->
                    if _.contains array_id_of_hosts, val.get("local_id")
                        return val


        getConnections = () ->
            # Filters hosts by current_group
            if $scope.current_group
                $scope.connections = $scope.hosts.filter_by_group($scope.current_group.get('local_id'), yes)
            else
                $scope.connections = _.clone $scope.hosts.models

            # Filters hosts by chosen_tags
            do filter_hosts_by_chosen_tags

            _.each $scope.connections, (val, key) ->
                #TODO make correct merge configs
                if val.get_ssh_identity()
                    val.set {username : val.get_ssh_identity().get("username")}
                    val.set {password : val.get_ssh_identity().get("password")}
                    val.set {key : val.get_ssh_identity().get("key")}
                $scope.connections[key] = val.toJSON do_not_encrypt: no


        # Prepares entities for template
        transformationData = () ->
            # Gets clone tags
            $scope.copy_tags = $scope.tags.toJSON({do_not_encrypt: no}) if $scope.tags

            # Prepares all groups
            do getGroups if $scope.groups

            # Prepares all hosts
            do getConnections if $scope.hosts


        $scope.isCheckTag = (tag) ->
            tags = []
            tags = if tag then _.find($scope.chosen_tags, (val) ->
                val.local_id is tag.local_id
            )
            if tags
                return yes
            else
                return no


        $scope.filterByGroup = (local_id) ->
            $scope.current_group = if local_id then $scope.groups.get(local_id) else null
            $timeout (-> do transformationData)


        $scope.filterByTag = (tag) ->
            if tag
                if $scope.isCheckTag tag
                    $scope.chosen_tags = _.without($scope.chosen_tags, _.findWhere($scope.chosen_tags, tag.local_id))
                else
                    $scope.chosen_tags = _.union $scope.chosen_tags, tag
            else
                $scope.chosen_tags = []
            $timeout (-> do transformationData)


        $scope.setSelectedConnection = (index) ->
            $scope.selectedIndex = index
            $scope.$broadcast "setSelectedIndex", index


        $scope.changeActiveList = () ->
            if $scope.connections.length and $scope.activities.length
                $scope.isLeftActive = not $scope.isLeftActive
                $scope.isRightActive = not $scope.isRightActive
            return no


        $scope.enter = () =>
            if $scope.query and $scope.query.indexOf("ssh") isnt -1
                connection = quickConnectParse.parse $scope.query
                @enterCallback connection


        jwerty.key '→', (->
            if $scope.is_interrupt_arrow_commands is yes and $scope.activities.length
                $scope.isLeftActive = no
                $scope.isRightActive = yes
            else if $scope.scope.is_interrupt_arrow_commands is no
                return yes
        ), $element


        jwerty.key '←', (->
            if $scope.is_interrupt_arrow_commands is yes and $scope.hosts.length
                $scope.isLeftActive = yes
                $scope.isRightActive = no
            else if $scope.scope.is_interrupt_arrow_commands is no
                return yes
        ), $element


        jwerty.key '⇥', (->
            if $scope.is_interrupt_arrow_commands is no and $scope.hosts.length and $scope.activities.length
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


        ###
            Methods are api between alfred directive and child directives
        ###

        # Sets selected item
        #
        # @param key    index within [1-scope.amount]
        @setSelectedIndex = (key) ->
            $scope.setSelectedConnection key

        # Calls callback function on event 'enter'
        #
        # @param connection    json-object
        @enterCallback = (connection) ->
            if connection
                $scope.onEnterHostCallback({connection: connection})

        # Saves paramaters: fromConnection, fromHistories
        @changeFromProperty = (from) ->
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
                $scope.onEditHostCallback({connection: connection})


        # Calls callback function on event 'remove'
        #
        # @param connection    json-object
        @remove = (connection) ->
            if connection
                $scope.onRemoveHostCallback({connection: connection})

        # Calls callback function on event 'add'
        @addConnection = () ->
            do $scope.onAddHostCallback

        do transformationData

        return @


    link: (scope, element, attrs) ->
        $input = element.find '#alfred-input'

        # When user doesn't search any information, we should interrupt arrow hotkeys,
        # otherwise we couldn't override it.
        scope.is_interrupt_arrow_commands = yes

        # If not define attrs, we should trigger jQuery events
        if not angular.isDefined(attrs.onEnterHostCallback)
            scope.onEnterHostCallback = (connection) ->
                $input.trigger "onEnterHostCallback", connection.connection
                return no

        if not angular.isDefined(attrs.onAddHostCallback)
            scope.onAddHostCallback = () ->
                $input.trigger "onAddHostCallback"
                return no

        if not angular.isDefined(attrs.onEditHostCallback)
            scope.onEditHostCallback = (connection) ->
                $input.trigger "onEditHostCallback", connection.connection
                return no

        if not angular.isDefined(attrs.onRemoveHostCallback)
            scope.onRemoveHostCallback = (connection) ->
                $input.trigger "onRemoveHostCallback", connection.connection
                return no

        if not angular.isDefined(attrs.onAddGroupCallback)
            scope.onAddGroupCallback = (group) ->
                $input.trigger "onAddGroupCallback", group
                return no

        if not angular.isDefined(attrs.onEditGroupCallback)
            scope.onEditGroupCallback = (group) ->
                $input.trigger "onEditGroupCallback", group
                return no

        if not angular.isDefined(attrs.onRemoveGroupCallback)
            scope.onRemoveGroupCallback = (group) ->
                $input.trigger "onRemoveGroupCallback", group
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

        # Checks query in order to switch/switch-off table state
        checkQuery = () ->
            if scope.query
                scope.is_interrupt_arrow_commands = no
            else
                scope.is_interrupt_arrow_commands = yes

            do scope.$apply

        initializeParameters = () ->
            scope.fromConnection = 0
            scope.fromHistory = 0
            scope.selectedIndex = 0
            scope.connectState = no

        initializeTableParameters = () ->
            scope.isLeftActive = if scope.hosts.length then yes else no
            scope.isRightActive = if scope.hosts.length then no else yes

        changeConnectState = (state) ->
            scope.connectState = state
            do scope.$apply

        scope.keydown = () ->
            $timeout (->
                do checkQuery
                if scope.query and scope.query.indexOf("ssh") is 0
                    changeConnectState yes
                    scope.$broadcast "quickConnect", scope.query   # If it is quick connect we should add element with parameters to the list
                else
                    changeConnectState no
                    scope.$broadcast "quickConnect", null
            ), 50

        do initializeParameters
        do initializeTableParameters
]
