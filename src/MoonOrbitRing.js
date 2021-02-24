

KMG.DefaultMoonOrbitRingConfig = {
	color : 0x4155F0,
	radius : 260.0,
	ringOpacity : 0.7,
	moonRadius : 200
};

KMG.MoonOrbitRingObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultMoonOrbitRingConfig);
	this.context = context;
	var scope = this;
	
	var distance = 0;
	var rightAscension = 0;
	var declination = 0;
	
	var rotation;


	this.setShadowInteraction(false);

	function createMesh() 
	{	

		var material = new THREE.MeshBasicMaterial({
									ambient		: 0x4155F0,
									color		: 0x4155F0,
									shininess	: 150, 
									specular	: new THREE.Color(0x000000),
									shading		: THREE.NoShading,
									transparent: true,
									side: THREE.DoubleSide,
									fog : false,
									opacity : scope.config.ringOpacity
									
								});

		var perigeeRadius = (config.radius) * (config.perigeeDistance / config.apogeeDistance);
		
		var geometry = new THREE.RingGeometry2( perigeeRadius, config.radius, 180, 1, 0, Math.PI * 2);
		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.z = -1000 * modelOptions.kmScalar;
		mesh.updateMatrix();
		

		return mesh;

	}
	this.add(createMesh());
	
	var moonSphere = new KMG.TexturedSphereObject(context, {texture:"Moon", radius : config.moonRadius, fog : false, ambient : 0xFFFFFF, emissive : 0xDDDDDD, color : 0x000000});
	this.add(moonSphere);
	
	
	this.setLunarRotation = function(iauRotation) {
		rotation = iauRotation;
	};
	
	
	this.setMoonPosition = function(dist, ra, dec) {
		distance = dist;
		rightAscension = ra;
		declination = dec;
	}
	
	this.update = function() {
		
		var moonX = (config.radius) * (distance / config.apogeeDistance);
		var position = new THREE.Vector3(moonX, 0, 0);
		position.rotateZ(rightAscension * KMG.PI_BY_180);
		
		moonSphere.position = position;
		
		if (rotation) {
			var q = new THREE.Quaternion();
			q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), KMG.RAD_90);
			q.multiply(rotation);
			
			var q0 = new THREE.Quaternion();
			q0.setFromAxisAngle(new THREE.Vector3(0, 0, 1), KMG.RAD_90);
			q0.multiply(q);
			
			moonSphere.rotation.setFromQuaternion(q0);
			moonSphere.updateMatrix();
			
			
		}
		
	};
	
};

KMG.MoonOrbitRingObject.prototype = Object.create( KMG.BaseObject.prototype );
