(function() {
  'use strict';
  var AlfredController;

  AlfredController = (function() {
    AlfredController.$inject = ['$scope', 'Connections', 'Histories'];

    function AlfredController(scope, Connections, Histories) {
      this.scope = scope;
      this.Connections = Connections;
      this.Histories = Histories;
      this.scope.histories = this.Histories.query();
      this.scope.connections = this.Connections.query();
      this.scope.isTable = true;
      this.scope.entities = this.scope.connections;
    }

    return AlfredController;

  })();

  angular.module('alfredApp').controller('AlfredController', AlfredController);

}).call(this);
