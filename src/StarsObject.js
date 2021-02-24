
KMG.StarsObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	var particleTexture = KMG.TextureMap.loadTexture('img/star_particle.png');
	particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.format = THREE.RGBAFormat;
		
	function buildStarsMeshWithIntensity(quantity, intensity, size)
	{
		
		var starfield = new THREE.Object3D();
		
		var  particles, geometry, material, parameters, i, h, color;
		
		geometry = new THREE.Geometry();
		
		var radius = 90000.0;
		material = new THREE.ParticleBasicMaterial( { map: particleTexture
													, color: intensity
													, size: size
													, fog : false
													, sizeAttenuation : false
													, transparent : true
													, blending : THREE.AdditiveBlending
													, depthTest : false
													, depthWrite : false
													} );
		
		for ( i = 0; i < quantity; i ++ ) {
			
			var u = Math.random() * 360.0;
			var v = Math.random() * 180.0;

			var vertex = new THREE.Vector3();
			vertex.x = -radius * Math.cos( 0 + u * Math.PI * 2 ) * Math.sin( 0 + v * Math.PI );
			vertex.y = radius * Math.cos( 0 + v * Math.PI );
			vertex.z = radius * Math.sin( 0 + u * Math.PI * 2 ) * Math.sin( 0 + v * Math.PI );

			geometry.vertices.push( vertex );

		}

		
		particles = new THREE.ParticleSystem( geometry, material );
		particles.rotation.x = Math.random() * 6;
		particles.rotation.y = Math.random() * 6;
		particles.rotation.z = Math.random() * 6;
		
		
		starfield.add( particles );
		
		return starfield;
	}
	
	
	function buildStarsWithRandomSizeFluctuation(quantity, intensity, size, starsMesh) {
	
		for (var i = 0; i <= quantity; i+=25) {
			
			starsMesh.add(buildStarsMeshWithIntensity(25, intensity, size + (Math.random() * 2.0 - 1.0)));
			
		}
	
	}
	
	
	
	var largeStarSize = 2;
	var smallStarSize = 2;
	
	var starsMesh = new THREE.Object3D();
	buildStarsWithRandomSizeFluctuation(75, 0xFFBBBB, largeStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(250, 0xBBBBFF, largeStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(175, 0xFFFFBB, largeStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(500, 0xFFFFFF, largeStarSize, starsMesh);
	
	buildStarsWithRandomSizeFluctuation(625, 0xFFBBBB, smallStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(1250, 0xBBBBFF, smallStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(625, 0xFFFFBB, smallStarSize, starsMesh);
	buildStarsWithRandomSizeFluctuation(2500, 0xFFFFFF, smallStarSize, starsMesh);
	
	this.mesh = starsMesh;
	
	this.add(starsMesh);
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
	};
};
KMG.StarsObject.prototype = Object.create( KMG.BaseObject.prototype );
