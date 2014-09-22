'use strict';
(function(World01Manager, MuEngine){

	/**
	* @param id {number} id of the zone
	* @param name {string} name of the zone ("north", "northwest"..)
	* @constructor
	*/
  var Zone =  function(id, worldmanager){
    this._worldman = worldmanager;
		this.id = id;
		if(this.id === 0){
			this.name = "northwest";
			this.minx = 0;
			this.miny = 0;
			this.maxx = 2;
			this.maxy = 2;

		}else if(this.id === 1){
			this.name = "north";
			this.minx = 3;
			this.miny = 0;
			this.maxx = 5;
			this.maxy = 2;

		}else if(this.id === 2){
			this.name = "northeast";
			this.minx = 6;
			this.miny = 0;
			this.maxx = 8;
			this.maxy = 2;

		}else if(this.id === 3){
			this.name = "west";
			this.minx = 0;
			this.miny = 3;
			this.maxx = 2;
			this.maxy = 5;

		}else if(this.id === 4){
			this.name = "center";
			this.minx = 3;
			this.miny = 3;
			this.maxx = 5;
			this.maxy = 5;
		}else if(this.id === 5){
			this.name = "east";
			this.minx = 6;
			this.miny = 3;
			this.maxx = 8;
			this.maxy = 5;

		}else if(this.id === 6){
			this.name = "southwest";
			this.minx = 0;
			this.miny = 6;
			this.maxx = 2;
			this.maxy = 8;

		}else if(this.id === 7){
			this.name = "south";
			this.minx = 3;
			this.miny = 6;
			this.maxx = 5;
			this.maxy = 8;

		}else if(this.id === 8){
			this.name = "southeast";
			this.minx = 6;
			this.miny = 6;
			this.maxx = 8;
			this.maxy = 8;
		}

  };

	/**
	* return a cell by its relative name (relative to the center of the zone)
	* like north, south, center..
	*/
	Zone.prototype.getCellByName = function(name){
		if(name === "northwest"){
				return this._worldman.grid.getCell(this.minx, this.miny);
		}else if(name === "north"){
				return this._worldman.grid.getCell(this.minx+1, this.miny);
		}else if(name === "northeast"){
				return this._worldman.grid.getCell(this.minx+2, this.miny);
		}else if(name === "west"){
				return this._worldman.grid.getCell(this.minx, this.miny+1);
		}else if(name === "center"){
				return this._worldman.grid.getCell(this.minx+1, this.miny+1);
		}else if(name === "east"){
				return this._worldman.grid.getCell(this.minx+2, this.miny+1);
		}else if(name === "southwest"){
				return this._worldman.grid.getCell(this.minx, this.miny+2);
		}else if(name === "south"){
				return this._worldman.grid.getCell(this.minx+1, this.miny+2);
		}else if(name === "southeast"){
				return this._worldman.grid.getCell(this.minx+2, this.miny+2);
		}
	};



  World01Manager.Zone = Zone;

})(World01Manager, MuEngine);
