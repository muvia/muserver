
/**
 * src/controllers/contactctrl.js
 * controller for contact form
 */

muPortalApp.controller('contactController', ['contactsrv', function(contactsrv) {

    this.name = null;
    this.email = null;
    this.message = null;

    this.error = null;

    this.doContact = function(){
        var self = this;
        //console.log("contactController.doContact ", this.name, this.email, this.message);
        contactsrv.sendMessage(this.name, this.email, this.message, function(error){
            self.error = error;
            if(self.error === null){
                console.log("contact message sent! how to notify the user?");
            }
            else{
                console.log("contact message failed! self.error had been set.");
            }
        });
    }

}]);