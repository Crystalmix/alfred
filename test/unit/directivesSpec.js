'use strict';


describe('Unit test alfredDirectives: alfred', function() {
    var $rootScope,
        $compile,
        scope,
        element;

    beforeEach(module('cfp.hotkeys', 'alfredDirective'));
    beforeEach(module('partials/alfred.html', 'partials/inactive-connections.html', 'partials/active-connections.html'));

    beforeEach(inject(
        function(_$compile_, _$rootScope_) {
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

        it("should render empty lists",
            function() {
                element = $compile(angular.element('<alfred connections="[]" histories="[]" amount="6" height-cell="42" placeholder="placeholder"></alfred>'))($rootScope);
                scope.$digest();
                var input,
                    ul,
                    li,
                    leftList,
                    rightList,
                    mainList;

                input = element.find("input");
                ul = element.find("ul");
                li = element.find("li");
                leftList = element.find("#left");
                rightList = element.find("#right");
                mainList = element.find(".main-list");

                expect(input.length).toBe(1);
                expect(ul.length).toBe(0);
                expect(li.length).toBe(0);
                expect(leftList.length).toBe(0);
                expect(rightList.length).toBe(0);
                expect(mainList.length).toBe(0);
            }
        );

        it("should render empty cells",
            function() {
                scope.connections = generateConnectionArray(10);
                scope.histories   = generateHistoryArray(4);
                scope.placeholder = "ssh user@hostname -p port";

                element = $compile(angular.element('<alfred connections="connections" histories="[]" amount="6" height-cell="42" placeholder="placeholder"></alfred>'))($rootScope);
                scope.$digest();
                var input,
                    ul,
                    li,
                    emptyCells,
                    scopeDirective;

                input = element.find("input");
                ul = element.find("ul");
                li = element.find("li");
                emptyCells = element.find(".empty-cell");

                expect(input.length).toBe(1);
                expect(ul.length).toBe(2);
                expect(li.length).toBe(12);
                expect(emptyCells.length).toBe(6);

                element = $compile(angular.element('<alfred connections="connections" histories="histories" amount="6" height-cell="42" placeholder="placeholder"></alfred>'))($rootScope);
                scope.$digest();
                emptyCells = element.find(".empty-cell");
                expect(emptyCells.length).toBe(2);

                element = $compile(angular.element('<alfred connections="[]" histories="histories" amount="6" height-cell="42" placeholder="placeholder"></alfred>'))($rootScope);
                scope.$digest();
                emptyCells = element.find(".empty-cell");
                scopeDirective = element.isolateScope();
                expect(scopeDirective.isRightActive).toBe(true);
                expect(scopeDirective.isLeftActive).toBe(false);
                expect(emptyCells.length).toBe(4);
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
        /* KeyCode
            {
                13: 'enter',
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
            }
        */

        it("should select item on click event",
            function() {
                var scopeDirective = element.isolateScope(),
                    liElems = element.find('li');

                expect(liElems.eq(0).hasClass('active')).toBe(true);
                expect(liElems.eq(1).hasClass('active')).toBe(false);
                expect(scopeDirective.selectedIndex).toBe(0);

                liElems.eq(2).trigger("click");
                expect(liElems.eq(2).hasClass('active')).toBe(true);
                expect(liElems.eq(0).hasClass('active')).toBe(false);
                expect(scopeDirective.selectedIndex).toBe(2);

                liElems.eq(4).trigger("click");
                expect(liElems.eq(4).hasClass('active')).toBe(true);
                expect(liElems.eq(2).hasClass('active')).toBe(false);
                expect(liElems.eq(0).hasClass('active')).toBe(false);
                expect(scopeDirective.selectedIndex).toBe(4);
            }
        );

        it("should make active list on event 'left/right arrow'",
            function() {
                var scopeDirective = element.isolateScope();

                KeyEvent.simulate(0, 37);
                expect(scopeDirective.isLeftActive).toBe(true);
                expect(scopeDirective.isRightActive).toBe(false);

                KeyEvent.simulate(0, 39);
                expect(scopeDirective.isLeftActive).toBe(false);
                expect(scopeDirective.isRightActive).toBe(true);

                KeyEvent.simulate(0, 39);
                expect(scopeDirective.isLeftActive).toBe(false);
                expect(scopeDirective.isRightActive).toBe(true);

                KeyEvent.simulate(0, 37);
                expect(scopeDirective.isLeftActive).toBe(true);
                expect(scopeDirective.isRightActive).toBe(false);
            }
        );

        it("should make active next/previous element",
            function() {
                var scopeDirective = element.isolateScope();

                expect(scopeDirective.selectedIndex).toBe(0);
                KeyEvent.simulate(0, 40);
                expect(scopeDirective.selectedIndex).toBe(1);
                KeyEvent.simulate(0, 40);
                expect(scopeDirective.selectedIndex).toBe(2);
                KeyEvent.simulate(0, 40);
                expect(scopeDirective.selectedIndex).toBe(3);
                KeyEvent.simulate(0, 40);
                expect(scopeDirective.selectedIndex).toBe(4);
                KeyEvent.simulate(0, 40);
                expect(scopeDirective.selectedIndex).toBe(5);
                KeyEvent.simulate(0, 40);
                expect(scopeDirective.selectedIndex).toBe(5);

                KeyEvent.simulate(0, 38);
                expect(scopeDirective.selectedIndex).toBe(4);
                KeyEvent.simulate(0, 38);
                expect(scopeDirective.selectedIndex).toBe(3);
                KeyEvent.simulate(0, 38);
                expect(scopeDirective.selectedIndex).toBe(2);
                KeyEvent.simulate(0, 38);
                expect(scopeDirective.selectedIndex).toBe(1);
                KeyEvent.simulate(0, 38);
                expect(scopeDirective.selectedIndex).toBe(0);
                KeyEvent.simulate(0, 38);
                expect(scopeDirective.selectedIndex).toBe(0);
            }
        );

        it("should make active element on event 'command+i'",
            function() {
                var scopeDirective = element.isolateScope(),
                    isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1,
                    hotKey = isMac ? 'meta' : 'ctrl';
                expect(scopeDirective.selectedIndex).toBe(0);
                KeyEvent.simulate('2'.charCodeAt(0), 50, [hotKey]);
                expect(scopeDirective.selectedIndex).toBe(1);
                KeyEvent.simulate('3'.charCodeAt(0), 51, [hotKey]);
                expect(scopeDirective.selectedIndex).toBe(2);
                KeyEvent.simulate('4'.charCodeAt(0), 52, [hotKey]);
                expect(scopeDirective.selectedIndex).toBe(3);
                KeyEvent.simulate('5'.charCodeAt(0), 53, [hotKey]);
                expect(scopeDirective.selectedIndex).toBe(4);
                KeyEvent.simulate('6'.charCodeAt(0), 54, [hotKey]);
                expect(scopeDirective.selectedIndex).toBe(5);
            }
        );
    });

});

