(function() {
  'use strict';
  angular.module('alfredDirective', []).directive('alfred', function() {
    return {
      restrict: 'AC',
      require: '?ngModel',
      scope: {
        options: '=',
        connections: '=',
        histories: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var connections, getCursorPosition, inArray, options, setCursorPosition, updateScope;
        options = scope.options ? scope.options : {};
        connections = (angular.isArray(scope.connections) ? scope.connections : [scope.connections]) || [];
        element.typeahead(scope.options, scope.connections);
        ngModel.$parsers.push(function(fromView) {
          var isDatum;
          isDatum = angular.isObject(fromView);
          if (options.editable === false) {
            ngModel.$setValidity('typeahead', isDatum);
            return isDatum != null ? isDatum : {
              fromView: void 0
            };
          }
          return fromView;
        });
        ngModel.$formatters.push((function(_this) {
          return function(fromModel) {
            var found;
            if (angular.isObject(fromModel)) {
              found = false;
              $.each(connections, function(index, connection) {
                var displayKey, query, search, value;
                query = connection.source;
                displayKey = connection.displayKey || 'value';
                value = (angular.isFunction(displayKey) ? displayKey(fromModel) : fromModel[displayKey]) || '';
                if (found) {
                  return false;
                }
                if (!value) {
                  search([]);
                  return;
                }
                query(value, search);
                return;
                return search = function(suggestions) {
                  var exists, _ref;
                  exists = inArray(suggestions, fromModel);
                  if (exists) {
                    ngModel.$setViewValue(fromModel);
                    found = true;
                  } else {
                    ngModel.$setViewValue((_ref = options.editable === false) != null ? _ref : {
                      undefined: fromModel
                    });
                  }
                  if (found || index === connections.length - 1) {
                    return setTimeout((function() {
                      return scope.$apply(function() {
                        return element.typeahead('val', value);
                      });
                    }), 0);
                  }
                };
              });
              return "";
            }
            return fromModel;
          };
        })(this));
        inArray = function(array, element) {
          var found;
          found = -1;
          angular.forEach(array, (function(_this) {
            return function(value, key) {
              if (angular.equals(element, value)) {
                return found = key;
              }
            };
          })(this));
          return found >= 0;
        };
        getCursorPosition = function(element) {
          var position, range;
          position = 0;
          element = element[0];
          if (document.selection) {
            range = document.selection.createRange();
            range.moveStart('character', -element.value.length);
            position = range.text.length;
          } else if (typeof element.selectionStart === 'number') {
            position = element.selectionStart;
          }
          return position;
        };
        setCursorPosition = function(element, position) {
          var range;
          element = element[0];
          if (document.selection) {
            range = element.createTextRange();
            range.move('character', position);
            return range.select();
          } else if (typeof element.selectionStart === 'number') {
            element.focus();
            return element.setSelectionRange(position, position);
          }
        };
        updateScope = function(object, suggestion, dataset) {
          return scope.$apply(function() {
            return ngModel.$setViewValue(suggestion);
          });
        };
        element.bind('typeahead:selected', (function(_this) {
          return function(object, suggestion, dataset) {
            updateScope(object, suggestion, dataset);
            return scope.$emit('typeahead:selected', suggestion, dataset);
          };
        })(this));
        element.bind('typeahead:autocompleted', (function(_this) {
          return function(object, suggestion, dataset) {
            updateScope(object, suggestion, dataset);
            return scope.$emit('typeahead:autocompleted', suggestion, dataset);
          };
        })(this));
        element.bind('typeahead:opened', (function(_this) {
          return function() {
            return scope.$emit('typeahead:opened');
          };
        })(this));
        element.bind('typeahead:closed', (function(_this) {
          return function() {
            return scope.$emit('typeahead:closed');
          };
        })(this));
        element.bind('typeahead:cursorchanged', (function(_this) {
          return function(event, suggestion, dataset) {
            return scope.$emit('typeahead:cursorchanged', event, suggestion, dataset);
          };
        })(this));
        return element.bind('input', (function(_this) {
          return function() {
            var preservePos;
            preservePos = getCursorPosition(element);
            scope.$apply(function() {
              var value;
              value = element.typeahead('val');
              return ngModel.$setViewValue(value);
            });
            return setCursorPosition(element, preservePos);
          };
        })(this));
      }
    };
  });

}).call(this);
