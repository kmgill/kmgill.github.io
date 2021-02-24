

KMG.DefaultBillBoardTextConfig = {
	textColor : 0xFFFFFF,
	fillStyle : "rgba(255,255,255,0.95)",
	font : "10px sans-serif"

};

KMG.BillBoardTextObject = function(context, text, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultBillBoardTextConfig);
	this.context = context;
	var _text = text;
	var scope = this;
	
	function createTextTexture(text, width, height) {
		var canvas1 = document.createElement('canvas');
		var context1 = canvas1.getContext('2d');
		canvas1.width = width;
		canvas1.height = height;
		context1.font = scope.config.font;
		context1.fillStyle = scope.config.fillStyle;

		context1.textAlign="center";				
		context1.fillText(text
							, canvas1.width / 2
							, canvas1.height / 2 + 20);	
		context1.fill();

		var texture1 = new THREE.Texture(canvas1) 
		texture1.needsUpdate = true;

		return texture1;
	}
	
	
	
	var geometry = new THREE.Geometry();

	var material = new THREE.ParticleBasicMaterial( { map: createTextTexture(_text, 100, 100)
													, color: this.config.textColor
													, size: 100
													, fog : false
													, sizeAttenuation : false
													, transparent : true
													, opacity : 1.0
													, blending : THREE.AdditiveBlending
													, depthWrite: false
													, depthTest: false
													} );
	var vertex = new THREE.Vector3(0, 0, 0);
	geometry.vertices.push( vertex );
	
	var particles = new THREE.ParticleSystem( geometry, material );
	this.add(particles);
	
	
	this.setText = function(text) {
		_text = text;
		material.map = createTextTexture(_text, 100, 100);
	};

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			

	};
};
KMG.BillBoardTextObject.prototype = Object.create( KMG.BaseObject.prototype );
	
	