###
    The alfred directive indicates input field, determines display table or list
###
alfredDirective.directive "alfred", ["quickConnectParse", "$timeout", "constant", (quickConnectParse, $timeout, constant) ->
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

        onAddGroupCallback: "&"
        onEditGroupCallback: "&"
        onRemoveGroupCallback: "&"

        onEnterHostCallback: "&"
        onAddHostCallback: "&"
        onEditHostCallback: "&"
        onRemoveHostCallback: "&"


    controller: ($scope, $element) ->
        $scope.query = null
        $scope.chosen_tags = []
        $scope.current_group = null
        $scope.children_group = []
        $scope.path_groups = []


        # Binds Backbone.collection events to update view
        collections_to_update = ["hosts", "groups", "tags", "taghosts"]

        _.each collections_to_update, (val) ->
            $scope[val].on("change", (model) ->
                # We must make check because before we remove model, we set status
                if model.changed["status"] isnt constant.status.delete
                    $timeout (->
                        do transformationData
                    )
            )

            $scope[val].on("add", () ->
                $timeout (->
                    do transformationData
                )
            )

            $scope[val].on("destroy", () ->
                $timeout (->
                    do transformationData
                )
            )


        getGroups = () ->
            current_group_id = if $scope.current_group then $scope.current_group.get("#{constant.local_id}") else null

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
                array_of_local_id_of_tags = _.union array_of_local_id_of_tags, val["#{constant.local_id}"]

            tag_hosts = $scope.taghosts.intersection_by_tags(array_of_local_id_of_tags)

            # Gets host.local_id from tag_hosts
            _.each tag_hosts, (val) ->
                if val.get("#{constant.tag_host.host}")["#{constant.local_id}"]
                    array_id_of_hosts = _.union array_id_of_hosts, val.get("#{constant.tag_host.host}")["#{constant.local_id}"]

            # Merges connections 
            if tag_hosts.length
                $scope.connections = _.filter $scope.connections, (val) ->
                    if _.contains array_id_of_hosts, val.get("#{constant.local_id}")
                        return val


        getConnections = () ->
            # Filters hosts by current_group
            if $scope.current_group
                $scope.connections = $scope.hosts.filter_by_group($scope.current_group.get("#{constant.local_id}"), yes)
            else
                $scope.connections = _.clone $scope.hosts.models

            # Filters hosts by chosen_tags
            do filter_hosts_by_chosen_tags

            # Gets array of models - copy
            _.each $scope.connections, (connection, key) =>
                $scope.connections[key] = $scope.connections[key].toJSON do_not_encrypt: no

            _.each $scope.connections, (val, key) ->
                #TODO make correct merge configs
                username_object = $scope.hosts.models[key].get_merged_username()
                if username_object and username_object.username
                    val.username = username_object.username
                else
                    val.username = null


        # Prepares entities for template
        transformationData = () ->
            # Gets clone tags
            $scope.copy_tags = $scope.tags.toJSON({do_not_encrypt: no}) if $scope.tags

            # Prepares all groups
            do getGroups if $scope.groups

            # Prepares all hosts
            do getConnections if $scope.hosts


        # Parsers json
        parseConnect = (json) =>
            try
                connection = quickConnectParse.parse json
                @enterCallback connection
            catch e
                console.warn e, json


        $scope.isChosenTag = (tag) ->
            tag = if tag then _.findWhere($scope.chosen_tags, {local_id: tag["#{constant.local_id}"]}) else []
            if tag
                return yes
            else
                return no


        $scope.filterByGroup = (group) ->
            id = if group then group["#{constant.local_id}"] else null
            $scope.current_group = if id then $scope.groups.get(id) else null
            $timeout (-> do transformationData)


        $scope.filterByTag = (tag) ->
            if tag
                if $scope.isChosenTag tag
                    $scope.chosen_tags = _.without($scope.chosen_tags, _.findWhere($scope.chosen_tags, {local_id: tag["#{constant.local_id}"]} ))
                else
                    $scope.chosen_tags = _.union $scope.chosen_tags, tag
            else
                $scope.chosen_tags = []
            $timeout (-> do transformationData)


        $scope.setSelectedConnection = (index) ->
            $scope.selectedIndex = index
            $scope.$broadcast "setSelectedIndex", index


        $scope.changeActiveList = () ->
            $scope.isLeftActive = not $scope.isLeftActive
            $scope.isRightActive = not $scope.isRightActive


        $scope.enter = () =>
            if $scope.query and $scope.query.indexOf("ssh") isnt -1
                parseConnect $scope.query


        $scope.editGroup = (group) ->
            group_model = $scope.groups.get(group["#{constant.local_id}"]) or $scope.groups.get(group.id)
            if group_model then $scope.onEditGroupCallback {group: group_model}


        $scope.removeGroup = (group) ->
            group_model = $scope.groups.get(group["#{constant.local_id}"]) or $scope.groups.get(group.id)
            if group_model then $scope.onRemoveGroupCallback {group: group_model}


        $scope.safeApply = (expr) ->
            unless $scope.$$phase
                if expr then $scope.$apply expr else do $scope.$apply


        $scope.addConnection = ($event) ->
            do $event.preventDefault
            do $event.stopPropagation
            $scope.onAddHostCallback {parent_group: $scope.current_group}
#            @addConnection($scope.currentGroup)


        $scope.addGroup = ($event) ->
            do $event.preventDefault
            do $event.stopPropagation
            $scope.onAddGroupCallback {parent_group: $scope.current_group}
#            @addGroup($scope.currentGroup)


        # --- Defines hotkeys

        jwerty.key '→', (->
            if $scope.is_interrupt_arrow_commands is yes
                $scope.isLeftActive = no
                $scope.isRightActive = yes
                return no
            else
                return yes
        ), $element


        jwerty.key '←', (->
            if $scope.is_interrupt_arrow_commands is yes
                $scope.isLeftActive = yes
                $scope.isRightActive = no
                return no
            else
                return yes
        ), $element


        jwerty.key '⇥', (->
            if $scope.is_interrupt_arrow_commands is yes
                $scope.isLeftActive = not $scope.isLeftActive
                $scope.isRightActive = not $scope.isRightActive
                return no
            else
                return yes
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
                parseConnect $scope.query
            else
                $scope.$broadcast "enter"
        ), $element

        # --- End Defines hotkeys

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
        @enterCallback = (host) ->
            if host
                host_model = $scope.hosts.get(host["#{constant.local_id}"]) or host
                if host_model then $scope.onEnterHostCallback({host: host_model})


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
            do $scope.safeApply

        # Calls callback function on event 'edit'
        #
        # @param connection    json-object
        @edit = (connection, always_open_form) ->
            if connection
                connection_model = $scope.hosts.get(connection["#{constant.local_id}"]) or $scope.hosts.get(connection.id)
                if connection_model then $scope.onEditHostCallback {host: connection_model, always_open_form: always_open_form}

        # Calls callback function on event 'remove'
        #
        # @param connection    json-object
        @removeConnection = (connection) ->
            if connection
                connection_model = $scope.hosts.get(connection["#{constant.local_id}"]) or $scope.hosts.get(connection.id)
                if connection_model then $scope.onRemoveHostCallback {host: connection_model}

#        # Calls callback function on event 'add'
#        @addConnection = (current_group) ->
#            $scope.onAddHostCallback {parent_group: current_group}
#
#        # Calls callback function on event 'add'
#        @addGroup = (current_group) ->
#            $scope.onAddGroupCallback {parent_group: current_group}


        do transformationData

        return @


    link: (scope, element, attrs) ->
        $input = element.find '#alfred-input'

        # When user doesn't search any information, we should interrupt arrow hotkeys,
        # otherwise we couldn't override it.
        scope.is_interrupt_arrow_commands = yes

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

            do scope.safeApply


        initializeParameters = () ->
            scope.fromConnection = 0
            scope.fromHistory = 0
            scope.selectedIndex = null
            scope.connectState = no


        initializeTableParameters = () ->
            scope.isLeftActive = yes
            scope.isRightActive = no


        changeConnectState = (state) ->
            scope.connectState = state
            do scope.safeApply


        scope.keydown = () ->
            $timeout (->
                do checkQuery
                if scope.query and scope.query.indexOf("ssh") is 0
                    changeConnectState yes
                else
                    changeConnectState no
            ), 50


        do initializeParameters
        do initializeTableParameters
]
