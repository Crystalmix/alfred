(function() {
  'use strict';
  angular.module('alfredApp', ['ui.router', 'httpServices', 'ng-context-menu', 'alfredDirective', 'lumx', 'ngMaterial', 'pasvaz.bindonce']).config([
    '$stateProvider', '$urlRouterProvider', '$mdThemingProvider', function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
      $urlRouterProvider.otherwise('/view1');
      $stateProvider.state('view1', {
        url: '/view1',
        templateUrl: 'partials/mainView.html',
        controller: 'AlfredController'
      });
      $mdThemingProvider.theme("default").primaryPalette("blue");
    }
  ]);

}).call(this);
