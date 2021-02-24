
KMG.DefaultBasicAsteroidBeltConfig = {

	innerRadius : 260.0,
	outterRadius : 400.0,
	quantity : 2000,
	sizeAttenuation : true,
	size : 2,
	color : 0xFFFFFF,
	hue : 0.5,
	saturation : 0.0,
	lightness : 0.75,
	targetObject : 0
};


KMG.BasicAsteroidBeltObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	
	
	this.config = config = KMG.Util.extend(config, KMG.DefaultBasicAsteroidBeltConfig);
	this.context = context;
	var scope = this;
	
	var lastBeltObject = null;
	
	function createBelt3dObject()
	{
		var innerRadius = config.innerRadius;
		var outterRadius = config.outterRadius;
		var quantity = config.quantity;
		
		var belt = new THREE.Object3D();
		
		var particleTexture = KMG.TextureMap.loadTexture('img/star_particle.png');
		particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
		particleTexture.format = THREE.RGBAFormat;
		
		var particles, geometry, material, parameters, i, h, color;
		
		var hslColor = new THREE.Color(config.color);
		hslColor.setHSL(config.hue, config.saturation, config.lightness);
		
		geometry = new THREE.Geometry();
		material = new THREE.ParticleBasicMaterial( { color: hslColor
														, size: config.size
														, map: particleTexture
														, fog : false
														, sizeAttenuation : config.sizeAttenuation
														, transparent : true
														, blending : THREE.AdditiveBlending
														} );

		for ( i = 0; i < quantity; i ++ ) {
			var u = Math.random() * 360.0;
			var v = Math.random() * 180.0;
			
			var radius = innerRadius + (outterRadius - innerRadius) * Math.random();
			
			var vertex = new THREE.Vector3(0, 0, radius);
			vertex.rotateY(Math.random() * 360.0 *(Math.PI/180.0));
			geometry.vertices.push( vertex );
		
		}
		
		particles = new THREE.ParticleSystem( geometry, material );
			
		belt.add( particles );
	
		return belt;
	}
	
	
	
	
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
		
		if (lastBeltObject) {
			this.remove(lastBeltObject);
		}
		lastBeltObject = createBelt3dObject();
		this.add(lastBeltObject);	
		
		if (scope.config.targetObject) {
			this.position = scope.config.targetObject.position.clone();
		}
	};
	this.update();
};
KMG.BasicAsteroidBeltObject.prototype = Object.create( KMG.BaseObject.prototype );