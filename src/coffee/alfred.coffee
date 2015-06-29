'use strict';

alfredDirective = angular.module("alfredDirective", [])


###
    A helper service that can parse quick connect parameters
    Possible cases:
        ssh               user@host
        ssh               user@host   -p port
        ssh               user@host   -pport

        ssh    -p port    user@host
        ssh    -pport     user@host
###
alfredDirective.factory "quickConnectParse", ["constant", (constant) ->
    ###
        Parses parameters
        @param input string that contains one of the possible cases
    ###
    parse : (input) ->
        options = {}

        cmd = null

        ARGS = [
            ['-p', '--port [NUMBER]', 'Port to connect to on the remote host.'],
        ]

        parser = new optparse.OptionParser(ARGS)

        parser.on 'port', (name, value) ->
            options.port = value

        parser.on 0, (value) ->
            cmd = value

        parser.on 1, (value) ->
            value = value.split('@')
            if value.length is 2
                options[constant.host.username] = value[0]
                options[constant.host.address] = value[1]

        parser.on 2, (value) ->
            options.other_args = value

        query = input.replace(/\s+@/g, '@').replace(/@\s+/g, '@').split(/\s+/) # remove duplicate white spaces in a string
        parser.parse(query)

        if cmd is 'ssh'
            if not options[constant.host.username] or not options[constant.host.address] or options.other_args?
                return {}
            options.port = 22 if not options.port?
            return options

        return {}
]


###
    A helper service that can return constants
###

alfredDirective.constant("constant", {

    local_id: "local_id"

    host:
        label: "label"
        username: "username"
        address: "address"
        port: "port"
        os_name: "os_name"

    tag_host:
        host: "host"
        tag: "tag"

    status:
        delete: "DELETE_FAILED"
})

###
    The alfred directive indicates input field, determines display table or list
###
alfredDirective.directive "alfred", ["quickConnectParse", "$timeout", "constant",
    (quickConnectParse, $timeout, constant) ->
        restrict: "E"
        replace: yes
        templateUrl: "src/templates/alfred.html"
        scope:
            uid: "="
            hosts: "="
            groups: "="
            taghosts: "="
            tags: "="
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

            # Private methods

            # Binds Backbone.collection events to update view
            collections_to_update = ["hosts", "groups", "tags", "taghosts"]

            _.each collections_to_update, (val) ->
                if $scope[val]
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

                path_groups = if current_group_id then $scope.groups.get_parent_groups(current_group_id) else []
                do path_groups.reverse

                children_group = if current_group_id then _.rest($scope.groups.get_all_children(current_group_id)) else $scope.groups.get_root()

                _.each children_group, (val, key) ->
                    children_group[key] = _.clone val.toJSON {do_not_encrypt: no}

                _.each path_groups, (val, key) ->
                    path_groups[key] = _.clone val.toJSON {do_not_encrypt: no}

                # Sets scope variable
                $scope.path_groups = path_groups
                $scope.children_group = children_group


            filter_hosts_by_chosen_tags = (connections) ->
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
                return connections = _.filter connections, (val) ->
                    if _.contains array_id_of_hosts, val.get("#{constant.local_id}")
                        return val


            getConnections = () ->
                # Filters hosts by current_group
                connections = []
                if $scope.current_group
                    connections = $scope.hosts.filter_by_group($scope.current_group.get("#{constant.local_id}"),
                        yes)
                else
                    connections = _.clone $scope.hosts.models

                # Filters hosts by chosen_tags
                connections = filter_hosts_by_chosen_tags connections if $scope.chosen_tags.length

                # Gets array of models - copy
                _.each connections, (connection, key) =>
                    connections[key] = connections[key].toJSON do_not_encrypt: no

                # Sets username field
                _.each connections, (val, key) ->
                    # Returns object username = {username: "username", is_merged: false}
                    username_object = $scope.hosts.models[key].get_merged_username()
                    if username_object and username_object.username
                        val[constant.host.username] = username_object[constant.host.username]
                    else
                        val[constant.host.username] = null

                    # Sets os_name field correctly
                    os_name = do val[constant.host.os_name].toLowerCase
                    if os_name and os_name isnt 'none'
                        val[constant.host.os_name] = os_name
                    else
                        val[constant.host.os_name] = ''

                # Sets scope variable
                $scope.connections = connections


            initChosenFlagsToTags = () ->
                _.each $scope.copy_tags, (val, key) ->
                    val["is_chosen"] = no


            # Prepares entities for template
            transformationData = () ->
                # Gets clone tags
                # TODO:It is not work correctly when 'edit tag' will appear
                if $scope.tags
                    if not $scope.copy_tags or $scope.tags.length isnt $scope.copy_tags.length
                        $scope.copy_tags = $scope.tags.toJSON({do_not_encrypt: no})
                else
                    $scope.copy_tags = []

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

            # End Private methods


            $scope.setSelectedConnection = (index) ->
                $scope.selectedIndex = index
                $scope.$broadcast "setSelectedIndex", index


            $scope.is_selectedIndex = () ->
                if $scope.selectedIndex? and $scope.selectedIndex >= 0
                    return yes
                return no


            $scope.filterByGroup = (group) ->
                id = if group then group["#{constant.local_id}"] else null
                $scope.current_group = if id then $scope.groups.get(id) else null
                $timeout (-> do transformationData)


            $scope.filterByTag = (tag) ->
                if tag
                    # Updates copy_tags if there is tag without local_id
                    unless tag.local_id
                        $scope.copy_tags = $scope.tags.toJSON({do_not_encrypt: no})
                        tag = _.findWhere $scope.copy_tags, {label: tag.label}

                    if tag["is_chosen"] is yes
                        $scope.chosen_tags = _.without($scope.chosen_tags,
                            _.findWhere($scope.chosen_tags, {local_id: tag["#{constant.local_id}"]}))
                        tag["is_chosen"] = no
                    else
                        $scope.chosen_tags = _.union $scope.chosen_tags, tag
                        tag["is_chosen"] = yes
                else
                    $scope.chosen_tags = []
                    do initChosenFlagsToTags
                $timeout (-> do transformationData)


            $scope.enter = () =>
                if $scope.query and $scope.query.indexOf("ssh") isnt -1
                    return parseConnect $scope.query
                if $scope.is_selectedIndex()
                    @enterCallback $scope.connections[$scope.selectedIndex]


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


            $scope.addGroup = ($event) ->
                do $event.preventDefault
                do $event.stopPropagation
                $scope.onAddGroupCallback {parent_group: $scope.current_group}


            # --- Defines hotkeys

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


            # Calls callback function on event 'edit'
            #
            # @param connection    json-object
            @edit = (connection, always_open_form) ->
                if connection
                    connection_model = $scope.hosts.get(connection["#{constant.local_id}"]) or $scope.hosts.get(connection.id)
                    if connection_model then $scope.onEditHostCallback {
                        host: connection_model,
                        always_open_form: always_open_form
                    }


            # Calls callback function on event 'remove'
            #
            # @param connection    json-object
            @removeConnection = (connection) ->
                if connection
                    connection_model = $scope.hosts.get(connection["#{constant.local_id}"]) or $scope.hosts.get(connection.id)
                    if connection_model then $scope.onRemoveHostCallback {host: connection_model}


            do transformationData

            return @


        link: (scope, element, attrs) ->
            $input = null

            $timeout (->
                $input = element.find '#alfred-input'
            )

            _setFocusAtInput = () ->
                do $input.focus
                return no

            # When user doesn't search any information, we should interrupt arrow hotkeys,
            # otherwise we couldn't override it.
            _is_interrupt_arrow_commands = yes


            # Checks query in order to switch/switch-off table state
            checkQuery = () ->
                if scope.query
                    _is_interrupt_arrow_commands = no
                else
                    _is_interrupt_arrow_commands = yes


            initializeParameters = () ->
                scope.selectedIndex = null
                scope.connectState = no


            changeConnectState = (state) ->
                scope.connectState = state
                do scope.safeApply


            scope.$on "setFocus", (event, uid) ->
                if uid is scope.uid
                    $timeout (->
                        do _setFocusAtInput
                    )


            scope.$watch $input, () ->
                $timeout (->
                    do _setFocusAtInput
                )


            scope.setFocusAtInput = ($event) ->
                # Checks click on out af alfred
                if $($event.target)[0] == element[0]
                    scope.setSelectedConnection null
                    do _setFocusAtInput
                else
                    return yes


            scope.keydown = () ->
                $timeout (->
                    do checkQuery
                    if scope.query and scope.query.indexOf("ssh") is 0
                        changeConnectState yes
                    else
                        changeConnectState no
                ), 50


            do initializeParameters
]


###
    The activeList directive displays active list with all hotkeys handlers

    connections         --  array of all json-objects
    filteredConnections --  array of queried json-objects
    subConnections      --  array of visible json-objects
###
alfredDirective.directive "activeList",  () ->
        require: "^alfred"
        restrict: "AE"
        templateUrl: "src/templates/active-connections.html"
        scope:
            connections:     "="
            heightCell:      "="
            query:           "="
            selectedIndex:   "="
            currentGroup:    "="
            uid:             "="

        controller: ($scope) ->

            $scope.setHeight = () ->
                height: $scope.heightCell + 'px'


            $scope.safeApply = (expr) ->
                unless $scope.$$phase
                    if expr then $scope.$apply expr else do $scope.$apply


            # Method api for child directive
            @select = (key) ->
                setSelectedConnection key
                do $scope.safeApply

            return @


        link: (scope, element, attrs, alfredCtrl) ->

            # Saves parent controller at the scope variable
            scope.alfredController = alfredCtrl

            scope.$watch "selectedIndex", (key) ->
                alfredCtrl.setSelectedIndex(key)


            # Listens to parent events 'arrow'
            #
            # @param event          jQuery event
            # @param orientation    ↓ or ↑
            scope.$on('arrow', (event, orientation) ->
                if orientation is 'up'
                    do activatePreviousItem
                else
                    do activateNextItem
            )

            # Listens to parent events 'setSelectedIndex'
            #
            # @param event    jQuery event
            # @param key      index within [1-scope.amount]
            scope.$on('setSelectedIndex', (event, key) ->
                scope.selectedIndex = key
            )

            # Listens to parent events 'enter'
            scope.$on('enter', (event, key) ->
                unless key?
                    key = getSelectedConnection()
                if scope.filteredConnections[key]?
                    setSelectedConnection(key)
                    connection = scope.filteredConnections[key]
                    scope.connect connection, key
            )
            # End Listens to parent events 'quickConnect'


            scope.edit = (connection) ->
                always_open_form = yes
                alfredCtrl.edit(connection, always_open_form)


            scope.remove = (connection) ->
                alfredCtrl.removeConnection(connection)


            scope.select = (key) ->
                setSelectedConnection key
                always_open_form = no
                alfredCtrl.edit(scope.filteredConnections[key], always_open_form)


            scope.connect = (connection, key) ->
                scope.select key
                alfredCtrl.enterCallback connection
                return no


            # Private methods

            setSelectedConnection = (index) ->
                scope.selectedIndex = index


            getSelectedConnection = () ->
                scope.selectedIndex


            activateNextItem = () ->
                currentIndex = getSelectedConnection()
                next = scope.filteredConnections[currentIndex+1]
                # Checks is next element?
                unless next?
                    setSelectedConnection(0)
                else
                    setSelectedConnection(++currentIndex)


            activatePreviousItem = () ->
                currentIndex = getSelectedConnection()
                prev = scope.filteredConnections[currentIndex-1]
                # Checks is prev element?
                unless prev?
                    setSelectedConnection(scope.filteredConnections.length - 1)
                else
                    setSelectedConnection(--currentIndex)


            # End Private methods


alfredDirective.directive "connectionItem",  () ->
        restrict: "A"
        require: "^activeList"

        link: (scope, element, attrs, connectionListCtrl) ->
            element.bind "mouseenter", () ->
                connectionListCtrl.select scope.key


###
    The whenScrolled directive displays active list with all hotkeys handlers

    connections         --  array of all json-objects
    filteredConnections --  array of queried json-objects
    subConnections      --  array of visible json-objects
###
alfredDirective.directive("whenScrolled", () ->
        restrict: "A"

        link: (scope, element) ->

            element.bind("mousewheel", (event) ->
                if(event.originalEvent.wheelDelta < 0)
                    scope.$apply scope.loadDown
                else
                    scope.$apply scope.loadUp
                event.preventDefault();
            )
)


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
