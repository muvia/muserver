/**
 * Muserver API
 * Contact: manage sending of contact message to muvia email
 */
"use strict";

var muconfig = require('../config');
var nodemailer = require("nodemailer");


// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", muconfig.contact_mail);

/**
 * POST api/contact
 * expects a payload with user email and message fields.
 * @returns {{authtoken}}
 */
exports.contact = function(request, reply){

	var name = request.payload.name;
	var email = request.payload.email;
    var message = request.payload.message;


    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: "email", // sender address
        to: muconfig.contact_mail.auth.user, // list of receivers
        subject: "contact from " + name, // Subject line
        text: message, // plaintext body
        html: "<b>"+message+"</b>" // html body
    };

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            error.output.statusCode = 401;
            error.reformat();
            reply(error);
        }else{
            console.log("Message sent: " + response.message);
            reply({info:"_msg_sent_"});
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });

};

