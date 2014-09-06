#muserver

##where is the config.js file?

The project requires the existence of a config.js file in the root of the server project.

Given the fact that this file contains production parameters like host, port, DB and email passwords, it must be kept out of the repo.

You have to create your own config.js file in order to run the server. this is the structure of the file:

module.exports.hostname = "YOUR_HOSTNAME";
module.exports.port = YOUR_PORT;
module.exports.fullhostname = "http://"+module.exports.hostname + ":" + module.exports.port;
module.exports.dburl ="YOUR_MONGO_DB_CONNECTION_STRING";
//transport object for nodemailer
module.exports.contact_mail = {
    service: "YOUR_EMAIL_SERVICE",
        auth: {
            user: "YOUR_EMAIL_USER",
            pass: "YOUR_EMAIL_PASSWORD"
        }
    };
module.exports.test = {
  user: 'YOUR_TEST_USER',
  pass: 'YOUR_PASSWORD_FOR_TEST_USER'
};

##known setup issues:

(18/05/2014) it seems traveloge had been updated in npm packages to hapi 4.x. no need of this workaround.

Working with HAPI 4.x.x, there is an compatibility issue with the official npm module of traveloge. it has been fixed in github, but not in the package (at 2014-05-09)
so, install manually from github:

npm install git+ssh://git@github.com/spumko/travelogue.git

