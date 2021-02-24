
KMG.DefaultLensFlareConfig = {
	lensFlareEnabled : false
};

/**
 * Shamelessly copied from http://threejs.org/examples/webgl_lensflares.html
 */
KMG.LensFlareObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultLensFlareConfig);
	this.context = context;
	var scope = this;

	
	// Create Stuff
	// See http://planetmaker.wthr.us/img/LICENSE.txt
	var textureFlare1 = KMG.TextureMap.loadTexture( "/img/lensflare1.png" );
	var textureFlare2 = KMG.TextureMap.loadTexture( "/img/lensflare2.png" );
	var textureFlare3 = KMG.TextureMap.loadTexture( "/img/lensflare3.png" );
	
	var lensFlare = new THREE.LensFlare( textureFlare1, 1000, 1.0, THREE.AdditiveBlending, 0xFFFFFF );
	
	lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
	lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

	this.lensFlare = lensFlare;
	
	this.add(lensFlare);
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
		
		
		this.lensFlare.traverse(function(obj) {
			obj.visible = scope.config.lensFlareEnabled;
		});
		
		if (!this.config.lensFlareEnabled) {
			this.remove(this.lensFlare);
			return;
		} else {
			this.add(lensFlare);
		}

		
		if (this.config.lightingType === "Directional") {
			this.lensFlare.position = new THREE.Vector3(-5000.0, 0, 0);
			this.lensFlare.position.rotateY(scope.config.sunlightDirection*(Math.PI/180.0));
		} else {
			this.lensFlare.position = new THREE.Vector3(0, 0, 0);
		}
		
		this.lensFlare.updateMatrix();

	};
};
KMG.LensFlareObject.prototype = Object.create( KMG.BaseObject.prototype );
