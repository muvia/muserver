//------------ SPRITE CLASS ----------

	/**
	* Sprite constructor
	* a sprite is a type of node who will render a bitmap.
	* bitmap is loaded through a ImageHandler.
	*/
	MuEngine.Sprite = function(path, width, height){
		this.width = width;
		this.height = height;
		this.path = path;
		this.imghandler = MuEngine.getImageHandler(path);
	};

	MuEngine.Sprite.prototype.render = function(mat, cam){
	
	};


