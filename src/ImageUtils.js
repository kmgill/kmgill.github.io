
KMG.ImageUtils = function ( ) {
	
	var scope = this;
	var canvas = document.createElement( 'canvas' );
	var context = canvas.getContext( '2d' );

	
	this.convertToGrayScale = function(img) {
		var w = img.image.width;
		var h = img.image.height;
		
		if (!w || !h) {
			return null;
		}
		
		canvas.width = w;
		canvas.height = h;
		context.drawImage(img.image, 0, 0, w, h, 0, 0, w, h);
		var data = context.getImageData(0, 0, w, h);
		
		var color = new THREE.Color( 0x000000 );
		var map = THREE.ImageUtils.generateDataTexture( w, h, color );
		
		//
		for(var n = 0; n < data.width * data.height; n++) {
			var dataIndex = n*4;
			var texIndex = n*3;
			var intesity = data.data[dataIndex+0] * 0.2989 + data.data[dataIndex+1] * 0.5870 + data.data[dataIndex+2] * 0.1140;
			
			map.image.data[texIndex+0] = intesity;
			map.image.data[texIndex+1] = intesity;
			map.image.data[texIndex+2] = intesity;
		}
		
		canvas.width = 1;
		canvas.height = 1;
		return map;

	};

};
