describe('Unit test filters: alfred', function() {
    var scope = {},
        filter;

    beforeEach(module('cfp.hotkeys', 'alfredDirective'));

    beforeEach(inject(
        function($injector) {
            scope.connections = generateArray(8);
            scope.prevquery = scope.query = null;
            scope.setSelectedConnection = function(index) {
                scope.selectedIndex = index;
            }
            scope.initializeParameteres = function() {
                scope.from = 0;
                scope.setSelectedConnection(0);
            }
            scope.changeSlider = function() {}
            filter = $injector.get("$filter")("filterConnections");
        })
    );

    var generateArray = function(length) {
        var arr = [];
            for(var i = 1; i <= length; ++i) {
                arr.push({
                    id : i,
                    label: i.toString()
                });
            }
        return arr;
    }

    it("should get initial list",
        function() {
            var filteredConnections = filter.call(scope, scope.connections, null, 0, 6);
            expect(filteredConnections.length).toEqual(6);
            expect(filteredConnections[0].label).toEqual("1");
            expect(scope.from).not.toBeDefined();
            expect(scope.selectedIndex).not.toBeDefined();
        }
    );

    it("should get empty list",
        function() {
            var filteredConnections;
            scope.connections = scope.connections.slice(0, 1)

            filteredConnections = filter.call(scope, scope.connections, null, 1, 7);
            expect(filteredConnections.length).toEqual(0);

            filteredConnections = filter.call(scope, scope.connections, null, 0, 6);
            expect(filteredConnections.length).toEqual(1);
        }
    );

    it("should initialize parameters if previous query doesn`t match to current",
        function() {
            scope.query = "2"
            filter.call(scope, scope.connections, null, 0, 6);
            expect(scope.from).toEqual(0);
            expect(scope.selectedIndex).toEqual(0);
            expect(scope.prevquery).toEqual("2");
        }
    );
});