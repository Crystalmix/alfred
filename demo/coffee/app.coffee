'use strict';

angular.module( 'alfredApp', [
      'ui.router',
      'httpServices',
      'ng-context-menu',
      'alfredDirective',
      'lumx'
]).
config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->

    $urlRouterProvider.otherwise '/view1'

    $stateProvider
        .state('view1', {
            url: '/view1',
            templateUrl: 'partials/mainView.html'
            controller: 'AlfredController'
        })

    return
])
