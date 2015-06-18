describe('Unit test filters: alfred', function() {
    var scope = {},
        filter;

    beforeEach(module('alfredDirective'));

    beforeEach(inject(
        function($filter) {
            scope.connections = generateArray(8);
            scope.prevquery = scope.query = null;
            scope.setSelectedConnection = function(index) {
                scope.selectedIndex = index;
            };
            filter = $filter("filterConnections")
        })
    );

    var generateArray = function(length) {
        var arr = [];
            for(var i = 1; i <= length; ++i) {
                arr.push({
                    id : i,
                    label: i.toString(),
                    username: "username_" + i,
                    address: "address_" + i
                });
            }
        return arr;
    };

    it("should get initial list",
        function() {
            var filteredConnections = filter(scope.connections, null, scope);
            expect(filteredConnections.length).toEqual(8);
            expect(filteredConnections[0].label).toEqual("1");
            expect(scope.selectedIndex).not.toBeDefined();
        }
    );

    it("should get empty list",
        function() {
            var filteredConnections;
            scope.query = "opop";

            filteredConnections = filter(scope.connections, "opop", scope);
            expect(filteredConnections.length).toEqual(0);

            scope.query = "0";
            filteredConnections = filter(scope.connections, "0", scope);
            expect(filteredConnections.length).toEqual(0);
        }
    );

    it("should get not empty list",
        function() {
            var filteredConnections;
            scope.query = "1";

            filteredConnections = filter(scope.connections, "1", scope);
            expect(filteredConnections.length).toEqual(1);

            scope.query = "2";
            filteredConnections = filter(scope.connections, "2", scope);
            expect(filteredConnections.length).toEqual(1);

            scope.query = "username_2";
            filteredConnections = filter(scope.connections, "username_2", scope);
            expect(filteredConnections.length).toEqual(1);

            scope.query = "address_1";
            filteredConnections = filter(scope.connections, "address_1", scope);
            expect(filteredConnections.length).toEqual(1);

            scope.query = "address";
            filteredConnections = filter(scope.connections, "address", scope);
            expect(filteredConnections.length).toEqual(filteredConnections.length);
        }
    );

    it("should initialize parameters if previous query doesn`t match to current",
        function() {
            scope.query = "2";
            filter(scope.connections, "1", scope);
            expect(scope.prevquery).toEqual("2");
        }
    );
});
