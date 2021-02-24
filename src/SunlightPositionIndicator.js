

KMG.DefaultSunlightPositionIndicatorConfig = {
	color : 0xFFFF00,
	radius : 200.0,
	indicatorSize : 1.0
};

KMG.SunlightPositionIndicator = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSunlightPositionIndicatorConfig);
	this.context = context;
	var scope = this;
	
	
	function createMesh() 
	{	

		var material = new THREE.MeshBasicMaterial({
									ambient		: config.color,
									color		: config.color,
									shading		: THREE.NoShading,
									transparent: false,
									side: THREE.DoubleSide,
									fog : false,
									opacity : 1.0
									
								});


		var geometry = new THREE.RingGeometry2(0, config.indicatorSize, 180, 1, 0, Math.PI * 2);
		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.z = config.radius;
		return mesh;

	}
	this.add(createMesh());
	this.setShadowInteraction(false);
	
	
	this.update = function() {
		
		
		
	};
	
	
};
KMG.SunlightPositionIndicator.prototype = Object.create( KMG.BaseObject.prototype );
