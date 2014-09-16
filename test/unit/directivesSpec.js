'use strict';

var _keycode_dictionary;

_keycode_dictionary = {
    0: "\\",
    8: "backspace",
    9: "tab",
    12: "num",
    13: "enter",
    16: "shift",
    17: "ctrl",
    18: "alt",
    19: "pause",
    20: "caps",
    27: "esc",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    44: "print",
    45: "insert",
    46: "delete",
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "a",
    66: "b",
    67: "c",
    68: "d",
    69: "e",
    70: "f",
    71: "g",
    72: "h",
    73: "i",
    74: "j",
    75: "k",
    76: "l",
    77: "m",
    78: "n",
    79: "o",
    80: "p",
    81: "q",
    82: "r",
    83: "s",
    84: "t",
    85: "u",
    86: "v",
    87: "w",
    88: "x",
    89: "y",
    90: "z",
    91: "cmd",
    92: "cmd",
    93: "cmd",
    96: "num_0",
    97: "num_1",
    98: "num_2",
    99: "num_3",
    100: "num_4",
    101: "num_5",
    102: "num_6",
    103: "num_7",
    104: "num_8",
    105: "num_9",
    106: "num_multiply",
    107: "num_add",
    108: "num_enter",
    109: "num_subtract",
    110: "num_decimal",
    111: "num_divide",
    124: "print",
    144: "num",
    145: "scroll",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "\'",
    223: "`",
    224: "cmd",
    225: "alt",
    57392: "ctrl",
    63289: "num",
    59: ";"
  };


describe('Unit test alfredDirectives: alfred', function() {
    var $rootScope,
        $compile,
        scope,
        element,
        listener,
        SHIFT;

    SHIFT = false;

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

    beforeEach(function(){
        var scopeDirective = element.isolateScope();
        listener = scopeDirective.listener;
    });

    afterEach(function(){
        listener.reset();
    });

    var event_for_key, on_keydown, on_keyup, convert_readable_key_to_keycode, press_key,
        __indexOf = [].indexOf || function (item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        };

    convert_readable_key_to_keycode = function (keyname) {
        var keycode, name, _ref;
        _ref = window._keycode_dictionary;
        for (keycode in _ref) {
            name = _ref[keycode];
            if (name === keyname) {
                return keycode;
            }
        }
    };

    event_for_key = function (key) {
        var event, key_code;
        event = {};
        event.preventDefault = function () {
        };
        event.shiftKey = SHIFT;
        spyOn(event, "preventDefault");
        key_code = convert_readable_key_to_keycode(key);
        event.keyCode = key_code;
        return event;
    };

    on_keydown = function (key) {
        var event, _ref;
        if (key === "shift") {
            SHIFT = true;
        }
        event = event_for_key(key);
        event.metaKey = __indexOf.call(listener._keys_down, "meta") >= 0 || (_ref = listener.get_meta_key(), __indexOf.call(listener._keys_down, _ref) >= 0);
        listener._receive_input(event, true);
        listener._bug_catcher(event);
        return event;
    };

    on_keyup = function (key) {
        var event;
        if (key === "shift") {
            SHIFT = false;
        }
        event = event_for_key(key);
        listener._receive_input(event, false);
        return event;
    };

    press_key = function (key) {
        on_keydown(key);
        return on_keyup(key);
    };

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

                press_key("rigth");
                scopeDirective.$digest();
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


                input.on("onEnterCallback", function(event, connection){
                    expect(connection.id).toBe(2);
                    expect(connection.label).toBe('2');
                });
                input.on("onEditCallback", function(event, connection){
                    expect(connection.id).toBe(2);
                    expect(connection.label).toBe('2');
                });
                input.on("onRemoveCallback", function(event, connection){
                    expect(connection.id).toBe(2);
                    expect(connection.label).toBe('2');
                });
                input.on("onAddCallback", function(event, connection){
                    expect(connection).not.toBeDefined();
                });
                input.on("onUploadCallback", function(event, connection){
                    expect(connection.hostname).toBe('history - hostname2');
                });
                on_keydown('cmd');
                on_keydown('2');
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

                press_key("rigth")
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

                press_key("left");
                expect(scopeDirective.isLeftActive).toBe(true);
                expect(scopeDirective.isRightActive).toBe(false);

                press_key('right');
                expect(scopeDirective.isLeftActive).toBe(false);
                expect(scopeDirective.isRightActive).toBe(true);

                press_key("right");
                expect(scopeDirective.isLeftActive).toBe(false);
                expect(scopeDirective.isRightActive).toBe(true);

                press_key('left');
                expect(scopeDirective.isLeftActive).toBe(true);
                expect(scopeDirective.isRightActive).toBe(false);
            }
        );

        it("should make active next/previous element",
            function() {
                var scopeDirective = element.isolateScope();

                expect(scopeDirective.selectedIndex).toBe(0);
                press_key('down');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(1);
                press_key('down');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(2);
                press_key('down');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(3);
                press_key('down');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(4);
                press_key('down');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(5);
                press_key('down');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(5);

                press_key('up');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(4);
                press_key('up');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(3);
                press_key('up');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(2);
                press_key('up');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(1);
                press_key('up');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(0);
                press_key('up');
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
                on_keydown(hotKey);
                on_keydown('2');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(1);
                on_keydown(hotKey);
                on_keydown('3');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(2);
                on_keydown(hotKey);
                on_keydown('4');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(3);
                on_keydown(hotKey);
                on_keydown('5');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(4);
                on_keydown(hotKey);
                on_keydown('6');
                scopeDirective.$digest();
                expect(scopeDirective.selectedIndex).toBe(5);
            }
        );
    });

});

