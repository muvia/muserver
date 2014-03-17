	//------------ SPRITE CLASS ----------

	/**
	* Sprite constructor
	* a sprite is a type of node who will render a bitmap.
	* bitmap is loaded through a ImageHandler.
	* width, height will be taken from picture attributes
	*/
	MuEngine.Sprite = function(path /*,width, height*/){
		this.width = 1.0;
		this.height = 1.0;
		this.path = path;
		this.imghandler = MuEngine.getImageHandler(path);
		//bit flag to control anchor. ORed of ANCHOR_XXX flags. 
		this.anchor = 0; 

	};

	/*
	* sprite static attributes
	*/
	MuEngine.Sprite.prototype.g_p0 = vec3.create();
	MuEngine.Sprite.prototype.g_p1 = vec3.create();
	
	MuEngine.Sprite.prototype.ANCHOR_HCENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_VCENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_CENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_TOP = 1; 
	MuEngine.Sprite.prototype.ANCHOR_BOTTOM = 2;
	MuEngine.Sprite.prototype.ANCHOR_LEFT = 4;
	MuEngine.Sprite.prototype.ANCHOR_RIGHT = 8;

	MuEngine.Sprite.prototype.render = function(node, cam){
		//vec3.set(this.g_p1, this.imghandler.img.width, this.imghandler.img.height, 0.0);	
		vec3.transformMat4(this.g_p0, g_pZero, node.wm); 
		cam.renderSprite(this.g_p0, this.width, this.height, this.anchor,  this.imghandler);
	};


