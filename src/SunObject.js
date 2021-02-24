KMG.DefaultSunOptions = {
	texture : "Sun",
	scale : 1,
	radius : 200,
	coronaRadius : -1,
	ambient : 0xFFFFFF,
	color : 0xDDDDDD,
	emissive : 0xFFFFFF,
	material : KMG.MaterialLambert,
	specular : 0x000000,
	shadows : false,
	coronaTexture : "/img/sparkle.png"
};


KMG.SunObject = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSunOptions);
	this.context = context;
	var scope = this;
	
	var tDiffuse = KMG.TextureMap.loadTexture(config.coronaTexture);
	
	tDiffuse.wrapS = tDiffuse.wrapT = THREE.ClampToEdgeWrapping;
	tDiffuse.format = THREE.RGBAFormat;
	
	var coronaRadius = (config.coronaRadius > 0) ? config.coronaRadius : config.radius * 2 * 20;
	console.info(coronaRadius);
	var geometry = new THREE.Geometry();
	 
	var material = new THREE.SpriteMaterial({fog : false
											, map : tDiffuse
											, color : 0xFFFFFF
											, sizeAttenuation : true
											, transparent : false
											, blending : THREE.AdditiveBlending
											, useScreenCoordinates: false
											, depthWrite: false
											, depthTest: true
											});

	var sprite = new THREE.Sprite(material);
	sprite.scale.set(coronaRadius, coronaRadius, coronaRadius);
	this.add(sprite);
	
	/*
	var material = new THREE.ParticleBasicMaterial( { map : tDiffuse
													, color: 0xFFFA70
													, size: coronaRadius // This is stupid
													, fog : false
													, sizeAttenuation : true
													, transparent : true
													, opacity : 1.0
													, blending : THREE.AdditiveBlending
													, depthWrite: false
													, depthTest: true
													} );
	var vertex = new THREE.Vector3(0, 0, 0);
	geometry.vertices.push( vertex );
	particles = new THREE.ParticleSystem( geometry, material );
	
	this.add(particles);
	*/
	
	
	var sunSphere = new KMG.TexturedSphereObject(context, this.config);
	this.add(sunSphere);
	
	

	
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		
		
		material.map = tDiffuse;
	};
	
};
KMG.SunObject.prototype = Object.create( KMG.BaseObject.prototype );
	
