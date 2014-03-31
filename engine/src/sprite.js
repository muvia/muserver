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
		this.tilex = 0;
		this.tiley = 0;
		this.tilew = null;
		this.tileh = null;

	};

	/*
	* sprite static attributes
	*/
	
	MuEngine.Sprite.prototype.ANCHOR_HCENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_VCENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_CENTER = 0;
	MuEngine.Sprite.prototype.ANCHOR_TOP = 1; 
	MuEngine.Sprite.prototype.ANCHOR_BOTTOM = 2;
	MuEngine.Sprite.prototype.ANCHOR_LEFT = 4;
	MuEngine.Sprite.prototype.ANCHOR_RIGHT = 8;

	MuEngine.Sprite.prototype.render = function(node, cam){
		cam.renderSprite(node.wp, this);

	};


