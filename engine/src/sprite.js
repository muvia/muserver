	//------------ SPRITE CLASS ----------

	/**
	* Sprite constructor
	* a sprite is a type of node who will render a bitmap.
	* bitmap is loaded through a ImageHandler.
	* width, height will be taken from picture attributes
	*/
	MuEngine.Sprite = function(path /*,width, height*/){
		//this.width = width;
		//this.height = height;
		this.path = path;
		this.imghandler = MuEngine.getImageHandler(path);
	};

	/*
	* sprite static attributes
	*/
	MuEngine.Sprite.prototype.g_p0 = vec3.create();
	MuEngine.Sprite.prototype.g_p1 = vec3.create();


	MuEngine.Sprite.prototype.render = function(node, cam){
		//vec3.set(this.g_p1, this.imghandler.img.width, this.imghandler.img.height, 0.0);	
		vec3.transformMat4(this.g_p0, g_pZero, node.wm); 
		cam.renderSprite(this.g_p0, this.imghandler);
	};


