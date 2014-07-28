(function() {
  var httpServices;

  httpServices = angular.module('httpServices', ['ngResource']);

  httpServices.factory('Connections', [
    '$resource', function($resource) {
      return $resource('connections.json', {}, {
        query: {
          method: 'GET',
          isArray: true
        }
      });
    }
  ]);

  httpServices.factory('Histories', [
    '$resource', function($resource) {
      return $resource('histories.json', {}, {
        query: {
          method: 'GET',
          isArray: true
        }
      });
    }
  ]);

}).call(this);
