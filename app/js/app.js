(function() {
  'use strict';
  angular.module('alfredApp', ['ui.router', 'httpServices', 'alfredDirective', 'scroll']).config([
    '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/view1');
      $stateProvider.state('view1', {
        url: '/view1',
        templateUrl: 'partials/mainView.html',
        controller: 'AlfredController'
      });
    }
  ]);

}).call(this);
