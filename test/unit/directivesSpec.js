'use strict';


describe('Unit test alfredDirectives: connectionList', function() {
    var $rootScope,
        $compile,
        scope,
        templateOutHtml = "<connection-list connections='connections' amount='6'></connection-list>",
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
                }
            ]

    beforeEach(module('alfredDirective'));
    beforeEach(module('partials/alfred.html'));

    beforeEach(inject(
        function(_$compile_, _$rootScope_){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
        })
    );

    it("should render another template",
        function() {
            scope.connections = []
            var element = $compile(templateOutHtml)(scope);
            $rootScope.$digest();
            expect(element.html()).toContain('<input type="text" id="alfred-input" class="form-control input-lg input ng-pristine ng-untouched ng-valid" ng-model="query">');
    });


    it("should render list of connections",
        function() {
            scope.connections = connectionsArray;
            var element = $compile(templateOutHtml)(scope);
            $rootScope.$digest();
            var liElems = element.find('li');

            expect(liElems.eq(0).html()).toBeDefined();
            expect(liElems.eq(1).html()).toBeDefined();
            expect(liElems.eq(2).html()).toBeUndefined();
    });

    it("should select item on click event",
        function() {
            scope.connections = connectionsArray
            var element = $compile(templateOutHtml)(scope);
            $rootScope.$digest();
            var scopeDirective = scope.$$childTail;
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

    it("should select item on event arrow",
        function() {
            scope.connections = connectionsArray
            var element = $compile(templateOutHtml)(scope);
            $rootScope.$digest();
            var scopeDirective = scope.$$childTail;
            var liElems = element.find('li');
            var input = element.find('#alfred-input');

            var e = jQuery.Event("keydown");
            e.keyCode = 40;
            input.trigger(e);
            expect(liElems.eq(0).hasClass('active')).toBe(false);
            expect(liElems.eq(1).hasClass('active')).toBe(true);

            e.keyCode = 38;
            input.trigger(e);
            expect(liElems.eq(0).hasClass('active')).toBe(true);
            expect(liElems.eq(1).hasClass('active')).toBe(false);
    });
});


describe('Unit test scroll', function() {
    var $rootScope,
        $compile,
        scope,
        templateOutHtml = "<connection-list connections='connections' amount='2'></connection-list>",
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
            ]

    beforeEach(module('alfredDirective', 'scroll'));
    beforeEach(module('partials/alfred.html'));

    beforeEach(inject(
        function(_$compile_, _$rootScope_){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
        })
    );

    it("should change subConnection on event scroll",
        function() {
            scope.connections = connectionsArray
            var element = $compile(templateOutHtml)(scope);
            $rootScope.$digest();
            var scopeDirective = scope.$$childTail;
            var fixedElem = element.find('#fixed');

            var e = jQuery.Event("mousewheel");
            e.originalEvent = {
                wheelDelta : -120
            }
            fixedElem.trigger(e);

            expect(scopeDirective.from).toBe(1);
            expect(scopeDirective.offset).toBe(3);

            e.originalEvent = {
                wheelDelta : 120
            }
            fixedElem.trigger(e);

            expect(scopeDirective.from).toBe(0);
            expect(scopeDirective.offset).toBe(2);
    });

});

describe('Unit test alfredDirective: connectionItem', function() {
    var $rootScope,
        $compile,
        scope,
        templateOutHtml = "<connection-list connections='connections' amount='4'></connection-list>",
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
            ]

    beforeEach(module('alfredDirective'));
    beforeEach(module('partials/alfred.html'));

    beforeEach(inject(
        function(_$compile_, _$rootScope_){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
        })
    );

    it("should change selectedItem on event mouseenter",
        function() {
            scope.connections = connectionsArray
            var element = $compile(templateOutHtml)(scope);
            $rootScope.$digest();
            var scopeDirective = scope.$$childTail;
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