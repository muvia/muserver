#muserver

##known setup issues:

(18/05/2014) it seems traveloge had been updated in npm packages to hapi 4.x. no need of this workaround.

Working with HAPI 4.x.x, there is an compatibility issue with the official npm module of traveloge. it has been fixed in github, but not in the package (at 2014-05-09)
so, install manually from github:

npm install git+ssh://git@github.com/spumko/travelogue.git

