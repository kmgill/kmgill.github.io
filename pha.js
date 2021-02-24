
/* File: CentralSun.js */
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

/* File: Asteroid.js */
/*
function addOrbitingAsteroid(context, orbitConfig, speed, f, tickController) {
	
	var orbitScale = KMG.AU_TO_KM * modelOptions.kmScalar;
	
	var orbitConfig = KMG.Util.clone(orbitConfig);
	orbitConfig.scale = orbitScale;
	orbitConfig.segments = 512;
	orbitConfig.opacity = 0.1;
	orbitConfig.color = 0x00FF00;

	var dotConfig = {
		opacity : 0.1,
		color : 0xFFFFFF,
		//size : 40,
		//texture : 'img/sprites/vesta.png'
		texture : 'img/sprites/circle_50x50.png'
	};
	
	var asteroid;
	
	if (orbitConfig.name != "(2013 NJ)") {
		asteroid = new KMG.DotPlotObject(context, dotConfig);
	} else {
		var config = KMG.Util.extend({radius:200, fog:false, scale:modelOptions.kmScalar, texture:"asteroid", color:0xDDDDDD}, KMG.DefaultTexturedSphereOptions);
		asteroid = new KMG.TexturedSphereObject(engine.context, config);
	}
	addToPrimaryScene(asteroid);
	
	var orbitPathLine = new KMG.OrbitPathLine(context, orbitConfig);
	addToPrimaryScene(orbitPathLine);
	var orbiter = new KMG.EllipticalOrbiter(context, asteroid, orbitScale, speed, orbitConfig, null, tickController);
	
	asteroid.orbitConfig = orbitConfig;
	asteroid.nameSprite = null;
	asteroid.orbitPathLine = orbitPathLine;
	asteroids.push(asteroid);
}
*/

KMG.AsteroidObject = function(context, ephemeris, speed, tickController, config) {
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	var scalar = KMG.AU_TO_KM * config.kmScalar;
	
	var orbitConfig = KMG.Util.clone(ephemeris);
	orbitConfig.scale = scalar;
	orbitConfig.segments = 512;
	orbitConfig.opacity = 0.1;
	orbitConfig.color = 0x00FF00;
	
	
	var dotConfig = {
		opacity : 0.1,
		color : 0xFFFFFF,
		texture : 'img/sprites/circle_50x50.png'
	};
	
	
	var asteroid;
	
	if (orbitConfig.name != "(2013 NJ)") {
		asteroid = new KMG.DotPlotObject(context, dotConfig);
	} else {
		var config = KMG.Util.extend({radius:200, fog:false, scale:modelOptions.kmScalar, texture:"asteroid", color:0xDDDDDD}, KMG.DefaultTexturedSphereOptions);
		asteroid = new KMG.TexturedSphereObject(context, config);
	}
	this.add(asteroid);
	
	var orbitPathLine = new KMG.OrbitPathLine(context, orbitConfig);
	this.add(orbitPathLine);
	
	var orbiter = new KMG.EllipticalOrbiter(context, asteroid, scalar, speed, orbitConfig, null, tickController);
	this.orbitConfig = orbitConfig;
	this.nameSprite = null;
	this.orbitPathLine = orbitPathLine;

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			

	};
};
KMG.AsteroidObject.prototype = Object.create( KMG.BaseObject.prototype );
