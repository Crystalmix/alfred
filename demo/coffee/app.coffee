'use strict';

angular.module( 'alfredApp', [
      'ui.router',
      'httpServices',
      'ng-context-menu',
      'alfredDirective',
      'lumx',
      'ngMaterial'
]).
config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', ($stateProvider, $urlRouterProvider, $mdThemingProvider) ->

    $urlRouterProvider.otherwise '/view1'

    $stateProvider
        .state('view1', {
            url: '/view1',
            templateUrl: 'partials/mainView.html'
            controller: 'AlfredController'
        })

    $mdThemingProvider.theme("default")
        .primaryPalette("blue")

    return
])
