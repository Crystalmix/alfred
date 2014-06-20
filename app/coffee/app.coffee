'use strict';

angular.module( "alfredApp", [
      "ui.router"
]).
config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->

    $urlRouterProvider.otherwise '/view1'

    $stateProvider
        .state('view1', {
            url: '/view1',
            templateUrl: 'partials/partial1.html'
            controller: 'AlfredController'
        })
    return;
])
