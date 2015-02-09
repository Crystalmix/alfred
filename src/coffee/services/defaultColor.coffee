angular.module('myApp', ['ngMaterial'])
.config(($mdThemingProvider) ->
    $mdThemingProvider.theme('default')
    .primaryPalette('pink')
    .accentPalette('orange')
       )