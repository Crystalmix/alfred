'use strict';

angular.module( 'alfredApp', [
      'ui.router',
      'httpServices',
      'connectionDirective'
]).
config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->

    $urlRouterProvider.otherwise '/view1'

    $stateProvider
        .state('view1', {
            url: '/view1',
            templateUrl: 'partials/alfredView.html'
            controller: 'AlfredController'
        })
    return;
])
