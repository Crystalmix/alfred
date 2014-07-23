describe('Unit test filters: alfred', function() {
    var quickConnectParse,
        query,
        response;

    beforeEach(module('cfp.hotkeys', 'alfredDirective'));

    beforeEach(inject(
        function($injector) {
            quickConnectParse = $injector.get('quickConnectParse');
        }
    ));

    describe("tests with correct parameters", function() {
        it("should get all parameters",
            function() {
                query = "ssh user@localhost -p 222";
                response = quickConnectParse.parse(query);
                expect(response.port).toBe(222);
                expect(response.hostname).toBe('localhost');
                expect(response.ssh_username).toBe('user');
            }
        );
        it("should set default port",
            function() {
                query = "ssh user@localhost";
                response = quickConnectParse.parse(query);
                expect(response.port).toBe(22);
                expect(response.hostname).toBe('localhost');
                expect(response.ssh_username).toBe('user');
            }
        );
        it("should change position port",
            function() {
                query = "ssh -p 222 user@localhost";
                response = quickConnectParse.parse(query);
                expect(response.port).toBe(222);
                expect(response.hostname).toBe('localhost');
                expect(response.ssh_username).toBe('user');
            }
        );
        it("should ignore whitepaces",
            function() {
                query = "ssh -p 222          user         @         localhost";
                response = quickConnectParse.parse(query);
                expect(response.port).toBe(222);
                expect(response.hostname).toBe('localhost');
                expect(response.ssh_username).toBe('user');
            }
        );

        it("should set last port",
            function() {
                query = "ssh -p 222 user@localhost  -p 35";
                response = quickConnectParse.parse(query);
                expect(response.port).toBe(35);
                expect(response.hostname).toBe('localhost');
                expect(response.ssh_username).toBe('user');
            }
        );
    })

    describe("test witn incorrect parameters", function() {
        it("should return empty object, when not parameters", function() {
            query = "ssh";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});
        });

        it("should return empty object, when not command", function() {
            query = "-p 222 user@localhost  -p 35";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});
        });

        it("should return empty object, when not 'login' parameter", function() {
            query = "ssh @localhost";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});
        });

        it("should return empty object, when not '@' parameter", function() {
            query = "ssh usernamelocalhost";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});
        });

        it("should return empty object, when not 'host' parameter", function() {
            query = "ssh username@";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});
        });

        it("should return empty object, when not 'host', '@', 'login' parameter", function() {
            query = "ssh -p 22";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});
        });

        it("should return empty object, when parameters have spaces", function() {
            query = "ssh use rname@localhost -p 22";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});

            query = "ssh username@loca lhost -p 22";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});

            query = "ssh user name@loca lhost -p 22";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});

            query = "ssh -p 222 use rname@loca lhost";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});

            query = "ssh -p222 use rname@loca lhost";
            response = quickConnectParse.parse(query);
            expect(response).toEqual({});
        });
    })
});
