	//-------- IMAGE HANDLER CLASS -----------------

	/**
	 * Image Handler constructor
	 * it will load imgurl, and use g_defimg while imgurl is fully loaded.
	 */ 
	ImageHandler = function(imgurl){
		this.img = g_defimg;
		//start the async loading process..
		var self = this;
		var realimg = new Image();
		realimg.onload = function(){
			self.img = realimg;
		};
		realimg.src = imgurl;  		
	};


