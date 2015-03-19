'use strict';

describe('Unit test alfredDirectives: alfred', function() {
    var $rootScope,
        $compile,
        scope,
        element,
        listener;

    beforeEach(module('alfredDirective'));

    beforeEach(inject(
        function(_$compile_, _$rootScope_) {
            $compile          = _$compile_;
            $rootScope        = _$rootScope_;
            scope             = $rootScope;
            scope.connections = generateConnectionArray(16);
            scope.histories   = generateHistoryArray(10);
            scope.placeholder = "ssh user@hostname -p port";
            element           = $compile(angular.element('<alfred connections="connections" \
                                                                    histories="histories" \
                                                                    amount="6" \
                                                                    height-cell="42" \
                                                                    placeholder="placeholder" \
                                                                    on-enter-callback="enterConnection(connection)" \
                                                                    on-add-callback="addConnection()" \
                                                                    on-edit-callback="editConnection(connection)" \
                                                                    on-upload-callback="uploadConnection(connection)" \
                                                                    on-remove-callback="removeConnection(connection)"> \
                                                            </alfred>'))($rootScope);
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
                    id: i,
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

        it("should trigger parent scope callback",
            function() {
                var input = element.find("input"),
                    isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1,
                    hotKey = isMac ? 'meta' : 'ctrl';
                var scopeDirective = element.isolateScope();
                scope.enterConnection = function(connection) {
                    expect(connection.id).toBe(1);
                };
                scope.addConnection = function(connection) {
                    expect(connection).not.toBeDefined();
                };

                scope.editConnection = function(connection) {
                    expect(connection.id).toBe(1);
                };

                scope.removeConnection = function(connection) {
                    expect(connection.id).toBe(1);
                };

                scope.uploadConnection = function(connection) {
                    expect(connection.hostname).toBe('history - hostname2');
                };
                scope.connections = generateConnectionArray(16);
                scope.histories   = generateHistoryArray(10);
                scope.placeholder = "ssh user@hostname -p port";
                element           = $compile(angular.element('<alfred connections="connections" \
                                                                    histories="histories" \
                                                                    amount="6" \
                                                                    height-cell="42" \
                                                                    placeholder="placeholder" \
                                                                    on-enter-callback="enterConnection(connection)" \
                                                                    on-add-callback="addConnection()" \
                                                                    on-edit-callback="editConnection(connection)" \
                                                                    on-upload-callback="uploadConnection(connection)" \
                                                                    on-remove-callback="removeConnection(connection)"> \
                                                              </alfred>'))($rootScope);
                scope.$digest();

                var edit = element.find(".glyphicon-pencil"),
                    e = jQuery.Event("click");
                edit.trigger(e);

                var remove = element.find(".glyphicon-trash");
                e = jQuery.Event("click");
                remove.trigger(e);

                var add = element.find(".add");
                e = jQuery.Event("click");
                add.trigger(e);

                jwerty.fire("rigth", element);
                var upload = element.find(".glyphicon-upload");
                e = jQuery.Event("click");
                upload.trigger(e);
            }
        );

        it("should trigger jQuery events instead of callback",
            function() {
                var isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1,
                    hotKey = isMac ? 'meta' : 'ctrl',
                    input;
                element = $compile(angular.element('<alfred connections="connections" histories="histories" amount="6" height-cell="42" placeholder="placeholder"></alfred>'))($rootScope);
                scope.$digest();
                input = element.find("#alfred-input");

                var scopeDirective = element.isolateScope();
                listener = scopeDirective.listener;


                input.on("onEnterHostCallback", function(event, connection){
                    expect(connection.id).toBe(2);
                    expect(connection.label).toBe('2');
                });
                input.on("onEditHostCallback", function(event, connection){
                    expect(connection.id).toBe(2);
                    expect(connection.label).toBe('2');
                });
                input.on("onRemoveHostCallback", function(event, connection){
                    expect(connection.id).toBe(2);
                    expect(connection.label).toBe('2');
                });
                input.on("onAddHostCallback", function(event, connection){
                    expect(connection).not.toBeDefined();
                });
                input.on("onUploadCallback", function(event, connection){
                    expect(connection.hostname).toBe('history - hostname2');
                });
                jwerty.fire('cmd+2', element);
                scopeDirective.$digest();
                var edit = element.find(".glyphicon-pencil"),
                    e = jQuery.Event("click");
                edit.trigger(e);

                var remove = element.find(".glyphicon-trash");
                e = jQuery.Event("click");
                remove.trigger(e);

                var add = element.find(".add");
                e = jQuery.Event("click");
                add.trigger(e);

                jwerty.fire("rigth", element)
                scopeDirective.$digest();
                var upload = element.find(".glyphicon-upload");
                e = jQuery.Event("click");
                upload.trigger(e);
            }
        );
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

                jwerty.fire("left", element);
                expect(scopeDirective.isLeftActive).toBe(true);
                expect(scopeDirective.isRightActive).toBe(false);

                jwerty.fire('right', element);
                expect(scopeDirective.isLeftActive).toBe(false);
                expect(scopeDirective.isRightActive).toBe(true);

                jwerty.fire("right", element);
                expect(scopeDirective.isLeftActive).toBe(false);
                expect(scopeDirective.isRightActive).toBe(true);

                jwerty.fire('left', element);
                expect(scopeDirective.isLeftActive).toBe(true);
                expect(scopeDirective.isRightActive).toBe(false);
            }
        );

        it("should make active next/previous element",
            function() {
                var scopeDirective = element.isolateScope();

                expect(scopeDirective.selectedIndex).toBe(0);
                jwerty.fire('down', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(1);
                jwerty.fire('down', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(2);
                jwerty.fire('down', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(3);
                jwerty.fire('down', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(4);
                jwerty.fire('down', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(5);
                jwerty.fire('down', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(5);

                jwerty.fire('up', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(4);
                jwerty.fire('up', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(3);
                jwerty.fire('up', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(2);
                jwerty.fire('up', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(1);
                jwerty.fire('up', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(0);
                jwerty.fire('up', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(0);
            }
        );

        it("should make active element on event 'command+i'",
            function() {
                var scopeDirective = element.isolateScope(),
                    isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1,
                    hotKey = isMac ? 'cmd' : 'ctrl';
                expect(scopeDirective.selectedIndex).toBe(0);
                jwerty.fire('meta+2', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(1);
                jwerty.fire('meta+3', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(2);
                jwerty.fire('meta+4', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(3);
                jwerty.fire('meta+5', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(4);
                jwerty.fire('meta+6', element);
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(5);
            }
        );
    });

});

