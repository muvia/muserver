
/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('virtualworldController', ["$scope", "profilesrv", "localize", function($scope, profilesrv, localize) {
  'use strict';


  var self = this;


  /**
   *
   * @param profile
   */
  this.init = function(profile){
    this.canvas = document.getElementById("c");
    this.manager  = new World01Manager(this.canvas, profile, localize);

    //accessible controller initialization
    this.menu1 = new MuController.Menu("menu1", function(type, entryid){
      /*
      * clever trick! instead of "if .. else" for each MuController.event type,
      * we pass the type as a MuNarrator command so the active stage will receive
      * four different calls: on_selected_menu, on_executed_menu, on_selected_entry, on_executed_entry
      */
      MuNarrator.send(type, {entryid: entryid});
      //return self.manager.onMenuEntryTriggered(entryid);
    },
		function(symbol){
			return localize.getLocalizedString(symbol);
		});

    this.manager.buildAssets();
    MuNarrator.clear();
    this.manager.buildStages();
    this.manager.start();

    $scope.$on('$destroy', function () {
      self.manager.stop();
    });
  };

  /**
   *
   */
  profilesrv.getProfile(function(profile){
    self.init(profile);
  });


}]);
