
KMG.BackgroundImageSphereObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	var geometry = new THREE.SphereGeometry( 10000000, 64, 32 );
	geometry.computeTangents();
	
	
	var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(scope.config.backgroundImage);
	var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;

	var material = new THREE.MeshBasicMaterial({
								shading		: THREE.SmoothShading,
								map			: tDiffuse,
								fog			: false,
								side		: THREE.BackSide,
								depthWrite  : false
							});
	
	
	var mesh = new THREE.Mesh( geometry, material );
	
	mesh.position = new THREE.Vector3( 0, 0, 0 );

	// Create Stuff

	this.mesh = mesh;
	this.material = material;
	this.geometry = geometry;
	
	this.add(mesh);
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
		
		
		var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(scope.config.backgroundImage);
		var tDiffuse = null;
		if (texDefinition.name == "Webcam") {
			tDiffuse = texDefinition.texture;
		} else {
			tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		}

		this.material.map = tDiffuse;
		
	};
};
KMG.BackgroundImageSphereObject.prototype = Object.create( KMG.BaseObject.prototype );

