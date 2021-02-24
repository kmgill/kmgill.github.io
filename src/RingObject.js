
KMG.DefaultRingConfig = {
	displayRing : false,
	ringTexture : KMG.rings[0].name,
	ringHue : 0.5,
	ringSaturation : 0.0,
	ringLightness : 0.75,
	ringInnerRadius : 260.0,
	ringOutterRadius : 400.0,
	ringAngle : 0.0,
	showShadows : true,
	ringOpacity : 1.0,
	targetObject : 0
};

KMG.RingObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultRingConfig);
	this.context = context;
	var scope = this;
	

	function createMesh() 
	{	
		var texDefinition = KMG.TextureMap.getRingDefinitionByName(scope.config.ringTexture);
		var ringTexture = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		ringTexture.format = THREE.RGBAFormat;
		
		var hslColor = new THREE.Color(0xFFFFFF);
		hslColor.setHSL(scope.config.ringHue, scope.config.ringSaturation, scope.config.ringLightness);

		var material = new THREE.MeshLambertMaterial({
									ambient		: hslColor,
									color		: hslColor,
									shininess	: 150, 
									specular	: new THREE.Color(0x000000),
									shading		: THREE.SmoothShading,
									map		: ringTexture,
									transparent: true,
									side: THREE.DoubleSide,
									fog : false,
									opacity : scope.config.ringOpacity,
									depthWrite: false, 
									depthTest: true
								});

		var innerRadius = scope.config.ringInnerRadius;
		var outterRadius = scope.config.ringOutterRadius;
		
		innerRadius = (innerRadius < outterRadius) ? innerRadius : outterRadius;
		outterRadius = (outterRadius > innerRadius) ? outterRadius : innerRadius;
		
		var geometry = new THREE.RingGeometry2( innerRadius, outterRadius, 180, 1, 0, Math.PI * 2);
		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position = new THREE.Vector3( 0, 0, 0 );

		mesh.rotation.x = 90.0 * (Math.PI/180);
		mesh.rotation.y = scope.config.ringAngle * (Math.PI/180.0);
		
		mesh.updateMatrix();
		
		mesh.castShadow = scope.config.shadows;
		mesh.receiveShadow = scope.config.shadows;

		scope.uniforms = null;
		scope.mesh = mesh;
		scope.material = material;
		scope.geometry = geometry;
		
		return mesh;

	}

	this.add(createMesh());
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		this.remove(this.mesh);
		this.add(createMesh());

		this.mesh.visible = this.config.displayRing;

		if (scope.config.targetObject) {
			this.position = scope.config.targetObject.position.clone();
		} else {
			this.rotation.z = scope.config.axialTilt * (Math.PI/180);
		}
		
	};
};
KMG.RingObject.prototype = Object.create( KMG.BaseObject.prototype );

