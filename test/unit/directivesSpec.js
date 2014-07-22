'use strict';


describe('Unit test alfredDirectives: alfred', function() {
    var $rootScope,
        $compile,
        scope,
        element,
        connectionsArray = [
                {
                  "color_scheme": null,
                  "hostname": "dev.crystalnix.com",
                  "id": 3444,
                  "label": "0. digital",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3444/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "serverauditor",
                  "updated_at": "2014-06-20T05:24:31"
                },
                {
                  "color_scheme": null,
                  "hostname": "54.193.87.205",
                  "id": 3445,
                  "label": "",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3445/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "1. ubuntu",
                  "updated_at": "2014-06-06T07:18:41"
                },
                {
                  "color_scheme": null,
                  "hostname": "54.193.87.205",
                  "id": 3447,
                  "label": "2. dev.crystalnix.com",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3447/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "ubuntu",
                  "updated_at": "2014-06-11T09:58:03"
                },
                {
                  "color_scheme": null,
                  "hostname": "dev.crystalnix.com",
                  "id": 3448,
                  "label": "3. test",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3448/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "admin",
                  "updated_at": "2014-06-16T03:43:22"
                },
                {
                  "color_scheme": null,
                  "hostname": "dev.crystalnix.com",
                  "id": 3559,
                  "label": "4. dev.sa",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3559/",
                  "ssh_key": null,
                  "ssh_password": "3OVhaEwh6C5bGFb7",
                  "ssh_username": "serverauditor",
                  "updated_at": "2014-06-11T11:54:24"
                },
                {
                  "color_scheme": null,
                  "hostname": "localhost",
                  "id": 3560,
                  "label": "",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3560/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "5. zhulduz",
                  "updated_at": "2014-06-20T05:24:50"
                },
                {
                  "color_scheme": null,
                  "hostname": "dev.4crystalnix.com",
                  "id": 4444,
                  "label": "6. digital",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3444/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "4serverauditor",
                  "updated_at": "2014-06-20T05:24:31"
                },
                {
                  "color_scheme": null,
                  "hostname": "454.193.87.205",
                  "id": 4445,
                  "label": "",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3445/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "7. 4ubuntu",
                  "updated_at": "2014-06-06T07:18:41"
                },
                {
                  "color_scheme": null,
                  "hostname": "454.193.87.205",
                  "id": 4447,
                  "label": "8. dev.crystalnix.com",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3447/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "ubuntu",
                  "updated_at": "2014-06-11T09:58:03"
                },
                {
                  "color_scheme": null,
                  "hostname": "dev.8crystalnix.com",
                  "id": 4448,
                  "label": "9. test",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3448/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "admin",
                  "updated_at": "2014-06-16T03:43:22"
                },
                {
                  "color_scheme": null,
                  "hostname": "dev.crystalnix.com",
                  "id": 4559,
                  "label": "10. dev.sa",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3559/",
                  "ssh_key": null,
                  "ssh_password": "3OVhaEwh6C5bGFb7",
                  "ssh_username": "serverauditor",
                  "updated_at": "2014-06-11T11:54:24"
                },
                {
                  "color_scheme": null,
                  "hostname": "localhost",
                  "id": 5560,
                  "label": "",
                  "port": 22,
                  "resource_uri": "/api/v1/terminal/connection/3560/",
                  "ssh_key": null,
                  "ssh_password": "",
                  "ssh_username": "11. zhulduz",
                  "updated_at": "2014-06-20T05:24:50"
                }
            ];

    beforeEach(module('cfp.hotkeys', 'alfredDirective', 'scroll'));
    beforeEach(module('partials/alfred.html', 'partials/inactive-connections.html', 'partials/active-connections.html'));

    beforeEach(inject(
        function(_$compile_, _$rootScope_){
            $compile          = _$compile_;
            $rootScope        = _$rootScope_;
            scope             = $rootScope;
            scope.connections = connectionsArray
            scope.histories   = connectionsArray
            scope.placeholder = "ssh user@hostname -p port"
            element           = $compile(angular.element('<alfred connections="connections" histories="histories" amount="6" height-cell="42" placeholder="placeholder"></alfred>'))($rootScope);
            scope.$digest();
        })
    );

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

    it("should set next element is active",
        function() {
            var e, activeElement, notActiveElement;

            activeElement = element.find("#left").find("#0");
            notActiveElement = element.find("#left").find("#1");

            expect(element.isolateScope().selectedIndex).toEqual(0);
            expect(activeElement.hasClass("active")).toEqual(true);
            expect(notActiveElement.hasClass("active")).toEqual(false);

            e = jQuery.Event("mouseenter");
            e.keyCode = 40;
            notActiveElement.trigger(e);

            expect(element.isolateScope().selectedIndex).toEqual(1);
            expect(activeElement.hasClass("active")).toEqual(false);
            expect(notActiveElement.hasClass("active")).toEqual(true);
        }
    );

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
    });

    describe('Unit test hotkeys', function() {
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

    describe('Unit test scroll', function() {
        it("should change fromConnections at alfred scope on event scroll",
            function() {
                var scopeDirective = element.isolateScope();
                var fixedElem = element.find('#fixed');

                var e = jQuery.Event("mousewheel");
                e.originalEvent = {
                    wheelDelta : -120
                }
                fixedElem.trigger(e);

                expect(scopeDirective.fromConnection).toBe(1);
                expect(scopeDirective.fromHistory).toBe(0);

                e.originalEvent = {
                    wheelDelta : 120
                }
                fixedElem.trigger(e);

                expect(scopeDirective.fromConnection).toBe(0);
                expect(scopeDirective.fromHistory).toBe(0);
        });

    });

    describe('Unit test alfredDirective: connectionItem', function() {
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
        });
    });

});

