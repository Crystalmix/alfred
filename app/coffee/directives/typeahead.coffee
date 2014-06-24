'use strict';
#
# connections = connections
# histories = histories
#

angular.module('alfredDirective', [])

.directive 'alfred',  () ->
        restrict: 'AC',
        require: '?ngModel',
        scope: {
            options:     '='
            connections: '='
            histories:   '='
        }

        link: (scope, element, attrs, ngModel) ->

            options = if scope.options then scope.options else {}
            connections = (if angular.isArray(scope.connections) then scope.connections else [scope.connections]) || []

            element.typeahead(scope.options, scope.connections)

            # Parses and validates what is going to be set to model (called when: ngModel.$setViewValue(value))
            ngModel.$parsers.push (fromView) ->
            # Assuming that all objects are datums
            # See typeahead basics: https://gist.github.com/jharding/9458744#file-the-basics-js-L15
                isDatum = angular.isObject fromView
                if options.editable is no
                    ngModel.$setValidity('typeahead', isDatum)
                    return isDatum ? fromView : undefined
                fromView


            # Formats what is going to be displayed (called when: $scope.model = { object })
            ngModel.$formatters.push (fromModel) =>
                if angular.isObject(fromModel)
                    found = no
                    $.each(connections, (index, connection) =>
                        query = connection.source
                        displayKey = connection.displayKey || 'value'
                        value = (if angular.isFunction(displayKey) then displayKey(fromModel) else fromModel[displayKey]) or ''

                        if found
                            return no

                        if not value
                            # Fakes a request just to use the same function logic
                            search []
                            return

                        # Get suggestions by asynchronous request and updates the view
                        query value, search
                        return;

                        search = (suggestions) ->
                            exists = inArray suggestions, fromModel
                            if exists
                                ngModel.$setViewValue fromModel
                                found = yes
                            else
                                ngModel.$setViewValue(options.editable is no ? undefined : fromModel)


                            # At this point, digest could be running (local, prefetch) or could not be (remote)
                            # As bloodhound object is inaccessible to know that, simulates an async to not conflict
                            # with possible running digest
                            if(found or index is connections.length - 1)
                                setTimeout (->
                                    scope.$apply( () ->
                                        element.typeahead('val', value)
                                    )
                                ), 0
                    )
                    return ""
                return fromModel


            inArray = (array, element) ->
                found = -1;
                angular.forEach(array, (value, key) =>
                    if angular.equals(element, value)
                        found = key
                )
                found >= 0


            getCursorPosition = (element) ->
                position = 0
                element = element[0]

                if document.selection
                    range = document.selection.createRange()
                    range.moveStart('character', -element.value.length)

                    position = range.text.length
                else if (typeof element.selectionStart is 'number')
                    position = element.selectionStart

                return position


            setCursorPosition = (element, position) ->
                element = element[0];
                if (document.selection)
                    range = element.createTextRange();
                    range.move('character', position);
                    do range.select
                else if (typeof element.selectionStart is 'number')
                    do element.focus
                    element.setSelectionRange(position, position);


            updateScope = (object, suggestion, dataset) ->
                scope.$apply( () ->
                    ngModel.$setViewValue(suggestion)
                )

            # Update the value binding when a value is manually selected from the dropdown.
            element.bind('typeahead:selected', (object, suggestion, dataset) =>
                updateScope(object, suggestion, dataset)
                scope.$emit('typeahead:selected', suggestion, dataset)
            )

            # Update the value binding when a query is autocompleted.
            element.bind('typeahead:autocompleted', (object, suggestion, dataset) =>
                updateScope(object, suggestion, dataset)
                scope.$emit('typeahead:autocompleted', suggestion, dataset)
            )

            # Propagate the opened event
            element.bind('typeahead:opened', () =>
                scope.$emit('typeahead:opened')
            )

            # Propagate the closed event
            element.bind('typeahead:closed', () =>
                scope.$emit('typeahead:closed')
            )

            # Propagate the cursorchanged event
            element.bind('typeahead:cursorchanged', (event, suggestion, dataset) =>
                scope.$emit('typeahead:cursorchanged', event, suggestion, dataset)
            )

            # Update the value binding when the user manually enters some text
            # See: http://stackoverflow.com/questions/17384218/jquery-input-event
            element.bind('input',  () =>
                preservePos = getCursorPosition element
                scope.$apply( () =>
                    value = element.typeahead 'val'
                    ngModel.$setViewValue value
                )
                setCursorPosition element, preservePos
            )

