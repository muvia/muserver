var config = require('../../../config');
var frisby = require('frisby');


exports.login = function(){
  return frisby.create('must return 200 and auth token if valid usr, psw at /login path')
  .post(config.fullhostname+'/api/login', {
    usr:config.test.user,
    psw: config.test.pass
  })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  //.inspectJSON() //uncoment to see the returned token in the console
  .expectJSONTypes({
    tkn: String
  })
  .expectJSON({
    tkn: function(val){ return true;}
  });
};