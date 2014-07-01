'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
//    var $rootScope,
//        $compile,
//        template;

    beforeEach(module('alfredDirective'));//, 'app/partials/connectionList.html'));

//    beforeEach(inject(function(_$compile_, _$rootScope_, $templateCache) {
            //template = $templateCache.get('app/partials/connectionList.html');
		    //$templateCache.put('partials/connectionList.html',template);

//            $compile = _$compile_;
//            $rootScope = _$rootScope_;
//    }));

    it("should be",
            inject(function($compile, $rootScope){
                var $scope = $rootScope.$new();
                $scope.connections = []
                var element = angular.element("<connection-list connections={{connections}} amount='6'></connection-list>");
                element = $compile(element)($scope);
                $scope.$digest();
                console.log('*********', element.html(), element);
                expect(element.html()).toBe('<div class="alfred"></div>');
            })
//            $rootScope.connections = []
//            var element = $compile("<connection-list connections='connections' amount='6'></connection-list>")($rootScope);
//            $rootScope.$digest();
//            console.log(element.html(), $rootScope);
//            expect(element.html()).toBe('<div class="alfred"></div>');

    )

//    it("should be 4", function() {
       // scope.$digest()
        //expect(element.html()).toBe('<div class="alfred"></div>')
//    })


  /*beforeEach(module('myApp.directives'));

  describe('app-version', function() {
    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span app-version></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
    });
  });*/
});
