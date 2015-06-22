//'use strict';

describe('Unit test alfredDirectives: alfred', function () {
    var $rootScope,
        $compile,
        scope,
        element,
        listener,
        sa,
        $timeout,
        $filter;

    beforeEach(module('alfredDirective'));

    beforeEach(function (done) {
        inject(
            function (_$compile_, _$rootScope_, _$timeout_, _$filter_) {
                $compile = _$compile_;
                $rootScope = _$rootScope_;
                scope = $rootScope;
                $timeout = _$timeout_;
                $filter = _$filter_;
                scope.placeholder = "ssh user@hostname -p port";
                sa = new SA("https://serverauditor.com");

                sa.init().done((function (_this) {
                    return function () {
                        scope.uid = "1"
                        scope.hosts = sa.hosts;
                        scope.groups = sa.groups;
                        scope.taghosts = sa.taghosts;
                        scope.tags = sa.tags;
                        element = $compile(angular.element('<alfred uid="uid" \
                                                                hosts="hosts" \
                                                                groups="groups" \
                                                                taghosts="taghosts" \
                                                                tags="tags" \
                                                                amount="6" \
                                                                height-cell="64" \
                                                                placeholder="placeholder" \
                                                                on-add-group-callback="addGroup(parent_group)" \
                                                                on-edit-group-callback="editGroup(group)" \
                                                                on-remove-group-callback="removeGroup(group)" \
                                                                on-enter-host-callback="enterConnection(host)" \
                                                                on-add-host-callback="addConnection(parent_group)" \
                                                                on-edit-host-callback="editConnection(host)" \
                                                                on-remove-host-callback="removeConnection(host)"> \
                                                            </alfred>'))($rootScope);
                        scope.$digest();
                        done();
                    };
                })(this));
            })
    });


    afterEach(function (done) {
        sa.logout().done(function () {
            done();
        });
        sa = null;
    });

    describe('Init directive', function () {

        it("should render another template",
            function () {
                var input,
                    groups,
                    content_box,
                    add_buttom;

                input = element.find("input");
                groups = element.find(".groups-toolbar");
                content_box = element.find(".content-box");
                add_buttom = element.find(".add-buttom");
                expect(input.length).toEqual(1);
                expect(groups.length).toEqual(1);
                expect(content_box.length).toEqual(1);
                expect(add_buttom.length).toEqual(1);
            }
        );

        it("should init scope variables",
            function () {
                var scopeDirective = element.isolateScope()
                expect(scopeDirective.uid).toEqual("1");
                expect(scopeDirective.placeholder).toEqual("ssh user@hostname -p port");
                expect(scopeDirective.hosts).toBeDefined();
                expect(scopeDirective.groups).toBeDefined();
                expect(scopeDirective.taghosts).toBeDefined();
                expect(scopeDirective.tags).toBeDefined();
                expect(scopeDirective.query).toEqual(null);
                expect(scopeDirective.chosen_tags).toEqual([]);
                expect(scopeDirective.current_group).toEqual(null);
                expect(scopeDirective.children_group).toEqual([]);
                expect(scopeDirective.path_groups).toEqual([]);

                expect(scopeDirective.filterByGroup).toBeDefined();
                expect(scopeDirective.filterByTag).toBeDefined();
                expect(scopeDirective.setSelectedConnection).toBeDefined();
                expect(scopeDirective.is_selectedIndex).toBeDefined();
                expect(scopeDirective.isChosenTag).toBeDefined();
                expect(scopeDirective.enter).toBeDefined();
                expect(scopeDirective.editGroup).toBeDefined();
                expect(scopeDirective.removeGroup).toBeDefined();
                expect(scopeDirective.addConnection).toBeDefined();
                expect(scopeDirective.addGroup).toBeDefined();
                expect(scopeDirective.setFocusAtInput).toBeDefined();
                expect(scopeDirective.keydown).toBeDefined();
            }
        );

    });

    describe('Should update methods', function () {

            it("should update models",
                function (done) {
                    var scopeDirective = element.isolateScope();
                    // Update host
                    expect(scopeDirective.connections).toBeDefined();
                    expect(scopeDirective.connections.length).toEqual(0);

                    sa.hosts.add({address: "localhost"});
                    $timeout.flush();

                    expect(scopeDirective.connections.length).toEqual(1);
                    expect(scopeDirective.connections[0].address).toEqual("localhost");


                    // Update host
                    expect(scopeDirective.groups).toBeDefined();
                    expect(scopeDirective.groups.length).toEqual(0);

                    sa.groups.add({label: "root_group"});
                    $timeout.flush();

                    expect(scopeDirective.groups.length).toEqual(1);
                    expect(scopeDirective.groups.models[0].get("label")).toEqual("root_group");

                    // Update tag
                    expect(scopeDirective.tags).toBeDefined();
                    expect(scopeDirective.tags.length).toEqual(0);

                    sa.tags.add({label: "ubuntu"});
                    $timeout.flush();

                    expect(scopeDirective.tags.length).toEqual(1);
                    expect(scopeDirective.tags.models[0].get("label")).toEqual("ubuntu");

                    sa.hosts.reset();
                    sa.groups.reset();
                    sa.tags.reset();
                    done();
                }
            )
        }
    );

    describe("Should filter hosts", function () {
        var group, first_host, second_host, tag;
        beforeEach(function (done) {
            group = sa.groups.add({label: "localhost"});
            tag = sa.tags.add({label: "ubuntu"});
            $timeout.flush();
            var callback = function () {
                tag.save().done(function () {
                    first_host.set({tag: {local_id: tag.get("local_id")}});
                    tag_host = sa.taghosts.add({
                        host: {local_id: first_host.get("local_id")},
                        tag: {local_id: tag.get("local_id")}
                    });
                    done();
                })
            };

            group.save({}, {wait: true}).done(function () {
                first_host = sa.hosts.add({address: "remote.com"});
                second_host = sa.hosts.add({address: "127.0.0.1", group: {local_id: group.get("local_id")}});
                $timeout.flush();
                first_host.save_all({}).done(function () {
                    second_host.save_all({}).done(function () {
                        callback();
                    })
                })
            })
        });

        it("should filter by a group",
            function () {
                var scopeDirective = element.isolateScope();
                expect(scopeDirective.connections.length).toEqual(2);

                scopeDirective.filterByGroup(group.attributes);
                $timeout.flush();
                expect(scopeDirective.connections.length).toEqual(1);
            }
        );

        it("should filter by a tag",
            function () {
                var scopeDirective = element.isolateScope();
                expect(scopeDirective.connections.length).toEqual(2);
                expect(scopeDirective.chosen_tags.length).toEqual(0);

                scopeDirective.filterByTag(tag.attributes);
                $timeout.flush();
                expect(scopeDirective.connections.length).toEqual(1);
                expect(scopeDirective.chosen_tags.length).toEqual(1);
            }
        );


        describe('hotkeys test', function () {
            /* KeyCode
                 {
                     13: 'enter',
                     38: 'up',
                     40: 'down'
                 }
             */

            var first_host, second_host, third_host;
            beforeEach(function (done) {
                first_host = sa.hosts.add({address: "remote.com"});
                second_host = sa.hosts.add({address: "127.0.0.1"});
                third_host = sa.hosts.add({address: "o.com"});
                $timeout.flush();
                first_host.save_all({}).done(function () {
                    second_host.save_all({}).done(function () {
                        third_host.save_all({}).done(function () {
                            done();
                        })
                    })
                });
            });

            it("should select item on click event",
                function () {
                    var scopeDirective = element.isolateScope(),
                        liElems = element.find('.list.hosts');

                    expect(liElems.eq(0).hasClass('active')).toBe(false);
                    expect(liElems.eq(1).hasClass('active')).toBe(false);
                    expect(scopeDirective.selectedIndex).toBe(null);

                    liElems.eq(2).trigger("click");
                    expect(liElems.eq(2).hasClass('active')).toBe(true);
                    expect(liElems.eq(0).hasClass('active')).toBe(false);
                    expect(scopeDirective.selectedIndex).toBe(2);
                    //
                    //liElems.eq(4).trigger("click");
                    //expect(liElems.eq(4).hasClass('active')).toBe(true);
                    //expect(liElems.eq(2).hasClass('active')).toBe(false);
                    //expect(liElems.eq(0).hasClass('active')).toBe(false);
                    //expect(scopeDirective.selectedIndex).toBe(4);
                }
            );

            //it("should make active next/previous element",
            //    function () {
            //        var scopeDirective = element.isolateScope();
            //
            //        expect(scopeDirective.selectedIndex).toBe(0);
            //        jwerty.fire('down', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(1);
            //        jwerty.fire('down', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(2);
            //        jwerty.fire('down', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(3);
            //        jwerty.fire('down', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(4);
            //        jwerty.fire('down', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(5);
            //        jwerty.fire('down', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(5);
            //
            //        jwerty.fire('up', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(4);
            //        jwerty.fire('up', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(3);
            //        jwerty.fire('up', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(2);
            //        jwerty.fire('up', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(1);
            //        jwerty.fire('up', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(0);
            //        jwerty.fire('up', element);
            //        scopeDirective.$digest();
            //        expect(scopeDirective.selectedIndex).toBe(0);
            //    }
            //);

        })
    })
});
//
//        it("should trigger parent scope callback",
//            function() {
//                var input = element.find("input"),
//                    isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1,
//                    hotKey = isMac ? 'meta' : 'ctrl';
//                var scopeDirective = element.isolateScope();
//                scope.enterConnection = function(connection) {
//                    expect(connection.id).toBe(1);
//                };
//                scope.addConnection = function(connection) {
//                    expect(connection).not.toBeDefined();
//                };
//
//                scope.editConnection = function(connection) {
//                    expect(connection.id).toBe(1);
//                };
//
//                scope.removeConnection = function(connection) {
//                    expect(connection.id).toBe(1);
//                };
//
//                scope.uploadConnection = function(connection) {
//                    expect(connection.hostname).toBe('history - hostname2');
//                };
//                scope.connections = generateConnectionArray(16);
//                scope.histories   = generateHistoryArray(10);
//                scope.placeholder = "ssh user@hostname -p port";
//                element           = $compile(angular.element('<alfred connections="connections" \
//                                                                    histories="histories" \
//                                                                    amount="6" \
//                                                                    height-cell="42" \
//                                                                    placeholder="placeholder" \
//                                                                    on-enter-callback="enterConnection(connection)" \
//                                                                    on-add-callback="addConnection()" \
//                                                                    on-edit-callback="editConnection(connection)" \
//                                                                    on-upload-callback="uploadConnection(connection)" \
//                                                                    on-remove-callback="removeConnection(connection)"> \
//                                                              </alfred>'))($rootScope);
//                scope.$digest();
//
//                var edit = element.find(".glyphicon-pencil"),
//                    e = jQuery.Event("click");
//                edit.trigger(e);
//
//                var remove = element.find(".glyphicon-trash");
//                e = jQuery.Event("click");
//                remove.trigger(e);
//
//                var add = element.find(".add");
//                e = jQuery.Event("click");
//                add.trigger(e);
//
//                jwerty.fire("rigth", element);
//                var upload = element.find(".glyphicon-upload");
//                e = jQuery.Event("click");
//                upload.trigger(e);
//            }
//        );
//
//        it("should trigger jQuery events instead of callback",
//            function() {
//                var isMac = navigator.userAgent.toLowerCase().indexOf('mac') !== -1,
//                    hotKey = isMac ? 'meta' : 'ctrl',
//                    input;
//                element = $compile(angular.element('<alfred connections="connections" histories="histories" amount="6" height-cell="42" placeholder="placeholder"></alfred>'))($rootScope);
//                scope.$digest();
//                input = element.find("#alfred-input");
//
//                var scopeDirective = element.isolateScope();
//                listener = scopeDirective.listener;
//
//
//                input.on("onEnterHostCallback", function(event, connection){
//                    expect(connection.id).toBe(2);
//                    expect(connection.label).toBe('2');
//                });
//                input.on("onEditHostCallback", function(event, connection){
//                    expect(connection.id).toBe(2);
//                    expect(connection.label).toBe('2');
//                });
//                input.on("onRemoveHostCallback", function(event, connection){
//                    expect(connection.id).toBe(2);
//                    expect(connection.label).toBe('2');
//                });
//                input.on("onAddHostCallback", function(event, connection){
//                    expect(connection).not.toBeDefined();
//                });
//                input.on("onUploadCallback", function(event, connection){
//                    expect(connection.hostname).toBe('history - hostname2');
//                });
//                jwerty.fire('cmd+2', element);
//                scopeDirective.$digest();
//                var edit = element.find(".glyphicon-pencil"),
//                    e = jQuery.Event("click");
//                edit.trigger(e);
//
//                var remove = element.find(".glyphicon-trash");
//                e = jQuery.Event("click");
//                remove.trigger(e);
//
//                var add = element.find(".add");
//                e = jQuery.Event("click");
//                add.trigger(e);
//
//                jwerty.fire("rigth", element)
//                scopeDirective.$digest();
//                var upload = element.find(".glyphicon-upload");
//                e = jQuery.Event("click");
//                upload.trigger(e);
//            }
//        );
//    });

