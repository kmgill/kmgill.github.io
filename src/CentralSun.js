KMG.DefaultCentralSunConfig = {
	texture : KMG.starFlares[0].name,
	kmScalar : 0.000005
};

KMG.CentralSunObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultCentralSunConfig);
	var scope = this;
	this.context = context;
	
	var sunConfig = {radius:696342*config.kmScalar
					, fog:false
					, scale:config.kmScalar
					, texture:"Sun"
					, ambient: 0xFFFFFF
					, emissive: 0xFFFFFF
					, shading : false
					, color: 0xFFFFFF};
					
	var sun = new KMG.TexturedSphereObject(context, sunConfig);
	this.add(sun);
	
	var texDefinition = KMG.TextureMap.getFlareDefinitionByName(config.texture);
	var texture = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;

	texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
	texture.format = THREE.RGBAFormat;
	texture.needsUpdate = true;
	var star = new THREE.Object3D();
	var material = new THREE.SpriteMaterial({fog : false
											, color : 0xFFFFFF
											, sizeAttenuation : false
											, transparent : true
											, blending : THREE.AdditiveBlending
											, useScreenCoordinates: false
											, depthWrite: false
											, depthTest: true
											, map : texture
											});

	var sprite = new THREE.Sprite(material);
	sprite.scale.set( 100 , 100, 1 );
	star.add(sprite);
	star.update = function() { };
	star.position = new THREE.Vector3(0, 0, 0);
	this.add(star);
	
	this.isAtScreenPosition = function(x, y, sceneOffset, radius) {
		if (!radius) {
			radius = 0.033;
		}
		
		var projector = new THREE.Projector();
		var vector = new THREE.Vector3( x, y, 1 );
		
		var pos = this.position.clone();
		pos.add(sceneOffset.clone().negate());
		projector.projectVector( pos, context.camera );
		return (vector.distanceTo(pos) <= radius);
	}
	
	this.update = function() {
		
		if (sun) {
			sun.update();
		}
		
	};
};
KMG.CentralSunObject.prototype = Object.create( KMG.BaseObject.prototype );
