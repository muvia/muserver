
/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('virtualworldController', ["$scope", function($scope) {
    'use strict';


    var self = this;

    //game engine initialization
    this.canvas = document.getElementById("c");


    this.manager  = new World01Manager(this.canvas);

  //accessible controller initialization
  this.menu1 = new MuController.Menu("menu1", function(entryid){
    self.manager.onMenuEntryTriggered(entryid);
  });


    this.manager.build();


    this.manager.start();


  $scope.$on('$destroy', function () {
      self.manager.stop();
  });

}]);
