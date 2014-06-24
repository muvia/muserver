
/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('contactController', [function() {

    this.name = null;
    this.email = null;

    this.message = null;

    this.doContact = function(){
        console.log("contactController.doContact ", this.name, this.email, this.message);
    }

}]);