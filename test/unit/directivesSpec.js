'use strict';


describe('Unit test alfredDirectives: alfred', function() {
    var $rootScope,
        $compile,
        scope,
        element;

    beforeEach(module('cfp.hotkeys', 'alfredDirective', 'scroll'));
    beforeEach(module('partials/alfred.html', 'partials/inactive-connections.html', 'partials/active-connections.html'));

    beforeEach(inject(
        function(_$compile_, _$rootScope_){
            $compile          = _$compile_;
            $rootScope        = _$rootScope_;
            scope             = $rootScope;
            scope.connections = generateConnectionArray(16);
            scope.histories   = generateHistoryArray(10);
            scope.placeholder = "ssh user@hostname -p port";
            element           = $compile(angular.element('<alfred connections="connections" histories="histories" amount="6" height-cell="42" placeholder="placeholder"></alfred>'))($rootScope);
            scope.$digest();
        })
    );

    var generateConnectionArray = function(length) {
        var arr = [];
            for(var i = 1; i <= length; ++i) {
                arr.push({
                    id : i,
                    label: i.toString(),
                    hostname: "hostname" + i.toString(),
                    ssh_username: "ssh_username" + i.toString(),
                    ssh_password: "ssh_password" + i.toString()
                });
            }
        return arr;
    };

    var generateHistoryArray = function(length) {
        var arr = [];
            for(var i = 1; i <= length; ++i) {
                arr.push({
                    id : i,
                    hostname: "history - hostname" + i.toString(),
                    ssh_username: "history - ssh_username" + i.toString()
                });
            }
        return arr;
    };

    describe('initial state', function() {
        it("should render another template",
            function() {
                var input,
                    ul,
                    li,
                    leftList, rightList,
                    activeElement,
                    notActiveElement;

                input = element.find("input");
                ul = element.find("ul");
                li = element.find("li");
                leftList = element.find("#left");
                rightList = element.find("#right");
                activeElement = element.find("#left").find("#0");
                notActiveElement = element.find("#left").find("#3");

                expect(input.length).toEqual(1);
                expect(ul.length).toEqual(2);
                expect(li.length).toEqual(12);
                expect(leftList.hasClass("active")).toEqual(true);
                expect(rightList.hasClass("active")).toEqual(false);
                expect(activeElement.hasClass("active")).toEqual(true);
                expect(notActiveElement.hasClass("active")).toEqual(false);
            }
        );

        it("isolate scope should get parameters", function() {
            var input,
                scopeDirective = element.isolateScope(),
                fixedElem = element.find('#fixed'),
                scopeActiveList = fixedElem.scope();

            input = element.find("input");
            expect(input.attr("placeholder")).toEqual("ssh user@hostname -p port");
            expect(scopeDirective.heightCell).toEqual(42);
            expect(scopeDirective.amount).toEqual(6);
            expect(scopeDirective.histories.length).toEqual(10);
            expect(scopeDirective.connections.length).toEqual(16);
            expect(scopeActiveList.connections.length).toEqual(16);
            expect(scopeActiveList.filteredConnections.length).toEqual(16);
            expect(scopeActiveList.subConnections.length).toEqual(scopeActiveList.amount);
        });
    });


    describe('scroll directive', function() {
        it("should change from, offset parameters",
            function() {
                var scopeDirective = element.isolateScope(),
                    fixedElem = element.find('#fixed'),
                    scopeActiveList = fixedElem.scope(),
                    e = jQuery.Event("mousewheel");

                e.originalEvent = { wheelDelta : -120 };
                fixedElem.trigger(e);

                expect(scopeDirective.fromConnection).toBe(1);
                expect(scopeDirective.fromHistory).toBe(0);
                expect(scopeActiveList.from).toBe(1);
                expect(scopeActiveList.offset).toBe(7);
                expect(scopeActiveList.subConnections[0].hostname).toEqual("hostname2");

                e.originalEvent = {
                    wheelDelta : 120
                };
                fixedElem.trigger(e);

                expect(scopeDirective.fromConnection).toBe(0);
                expect(scopeDirective.fromHistory).toBe(0);
                expect(scopeActiveList.from).toBe(0);
                expect(scopeActiveList.offset).toBe(6);
                expect(scopeActiveList.subConnections[0].hostname).toEqual("hostname1");

                e.originalEvent = {
                    wheelDelta : 120
                };
                fixedElem.trigger(e);

                expect(scopeDirective.fromConnection).toBe(0);
                expect(scopeDirective.fromHistory).toBe(0);
                expect(scopeActiveList.from).toBe(0);
                expect(scopeActiveList.offset).toBe(6);
                expect(scopeActiveList.subConnections[0].hostname).toEqual("hostname1");
        });
    });

    describe("set active element on event mouseenter on connectionItem", function() {
        it("should change selectedItem on event mouseenter",
            function() {
                var scopeDirective = element.isolateScope();
                var liElems = element.find('li');

                expect(scopeDirective.selectedIndex).toBe(0);
                expect(liElems.eq(0).hasClass('active')).toBe(true);
                expect(liElems.eq(2).hasClass('active')).toBe(false);

                liElems.eq(2).trigger('mouseenter');

                expect(scopeDirective.selectedIndex).toBe(2);
                expect(liElems.eq(0).hasClass('active')).toBe(false);
                expect(liElems.eq(2).hasClass('active')).toBe(true);

                liElems.eq(5).trigger('mouseenter');
                expect(scopeDirective.selectedIndex).toBe(5);
                expect(liElems.eq(0).hasClass('active')).toBe(false);
                expect(liElems.eq(2).hasClass('active')).toBe(false);
                expect(liElems.eq(5).hasClass('active')).toBe(true);
        });
    });

    describe("set active list on event mouseenter on inactive list", function() {
        it("should change selectedItem on event mouseenter",
            function() {
                var scopeDirective = element.isolateScope(),
                    inActiveList = element.find('#inactive-list');

                inActiveList.trigger('mouseenter');
                expect(scopeDirective.isLeftActive).toBe(false);
                expect(scopeDirective.isRightActive).toBe(true);

                inActiveList = element.find('#inactive-list');
                inActiveList.trigger('mouseenter');
                expect(scopeDirective.isLeftActive).toBe(true);
                expect(scopeDirective.isRightActive).toBe(false);
            }
        );
    });

    describe('hotkeys test', function() {
        it("should select item on click event",
            function() {
                var scopeDirective = element.isolateScope();
                var liElems = element.find('li');

                expect(liElems.eq(0).hasClass('active')).toBe(true);
                expect(liElems.eq(1).hasClass('active')).toBe(false);
                expect(scopeDirective.amount).toBe(6);
                expect(scopeDirective.selectedIndex).toBe(0);

                scope.$apply(scopeDirective.setSelectedConnection(1));
                expect(scopeDirective.selectedIndex).toBe(1);
                expect(liElems.eq(0).hasClass('active')).toBe(false);
                expect(liElems.eq(1).hasClass('active')).toBe(true);

                liElems.eq(0).trigger("click");
                expect(liElems.eq(0).hasClass('active')).toBe(true);
                expect(liElems.eq(1).hasClass('active')).toBe(false);
            }
        );

        /*it("should select item on event arrow",
            function() {
                var liElems = element.find('li');
                var input = element.find('#alfred-input');

                var e = jQuery.Event("keydown");
                e.keyCode = 40;
                input.trigger(e);
                input.trigger("left")
                expect(liElems.eq(0).hasClass('active')).toBe(false);
                expect(liElems.eq(1).hasClass('active')).toBe(true);

                e.keyCode = 38;
                input.trigger(e);
                expect(liElems.eq(0).hasClass('active')).toBe(true);
                expect(liElems.eq(1).hasClass('active')).toBe(false);
        })*/
    });



});

