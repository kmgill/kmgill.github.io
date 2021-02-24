
/* File: DistanceLineObject.js */
KMG.DefaultDistanceLineConfig = {
	lineLength : 1000,
	position : new THREE.Vector3(0, 0, 0),
	color : 0xFFFFFF,
	earthRadius : 1
};

KMG.DistanceLineObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultDistanceLineConfig);
	this.context = context;
	var scope = this;
	
	var markerPoint = 0;
	var rightAscension = 0;
	var declination = 0;
	
	var earthRotation;

		 	
	var geometry = new THREE.Geometry();
	geometry.vertices.push( new THREE.Vector3(-this.config.lineLength, 0, 0) );
	geometry.vertices.push( new THREE.Vector3(this.config.lineLength, 0, 0) );
	var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF, opacity: 1.0, transparent :false , fog : false, lineWidth:2 } );
	var line = new THREE.Line( geometry,  material);
	line.position = config.position; 
	this.add(line);
	

	var earthSphere = new KMG.TexturedSphereObject(context, {texture:"earth", radius : config.earthRadius, fog : false, ambient : 0xFFFFFF, emissive : 0xAAAAAA});
	earthSphere.position = config.position.clone().add(new THREE.Vector3(-config.lineLength, 0, 0));
	this.add(earthSphere);
	
	
	var apogeeSphere = new KMG.TexturedSphereObject(context, {texture:"Moon", radius : config.moonRadius, fog : false, ambient : 0xFFFFFF, emissive : 0xAAAAAA});
	apogeeSphere.position = config.position.clone().add(new THREE.Vector3(config.lineLength, 0, 0));
	this.add(apogeeSphere);

	var perigeeX = -config.lineLength + (config.lineLength * 2) * (config.perigeeDistance / config.lineDistance);
	var perigeeSphere = new KMG.TexturedSphereObject(context, {texture:"Moon", radius : config.moonRadius, fog : false, ambient : 0xFFFFFF, emissive : 0xAAAAAA});
	perigeeSphere.position = config.position.clone().add(new THREE.Vector3(perigeeX, 0, 0));
	this.add(perigeeSphere);


	var moonSphere = new KMG.TexturedSphereObject(context, {texture:"Moon", radius : config.moonRadius, fog : false, ambient : 0xFFFFFF, emissive : 0xFFFFFF});
	moonSphere.position = config.position.clone().add(new THREE.Vector3(config.lineLength, 0, 0));
	this.add(moonSphere);

	this.setShadowInteraction(false);
	
	
	this.setEarthRotation = function(rotation) {
		earthRotation = rotation;
	};

	this.setMarkerPoint = function(d) {
		markerPoint = d;
	}
	
	this.setMoonPosition = function(ra, dec) {
		rightAscension = ra;
		declination = dec;
	}

	this.update = function() {
		var moonX = -config.lineLength + (config.lineLength * 2) * (markerPoint / config.lineDistance);
		moonSphere.position = config.position.clone().add(new THREE.Vector3(moonX, 0, 0));
		
		if (earthRotation) {
			earthSphere.rotation.setFromQuaternion(earthRotation);
			earthSphere.updateMatrix();
			
		}
		
		
		//earthSphere.rotation.y = rightAscension * KMG.PI_BY_180;
	};

	
	//return {
	//	update : update,
	//	setMarkerPoint : setMarkerPoint
	//};
	
};
KMG.DistanceLineObject.prototype = Object.create( KMG.BaseObject.prototype );

/* File: MoonOrbitRing.js */


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

/* File: MoonOrbitTrack.js */

KMG.DefaultMoonOrbitTrackConfig = {
	subdivisions : 4,
	opacity : 0.8,
	color : 0xCCCCCC,
	lineThickness : 2.5,
	radius : 260.0
	
};

KMG.MoonOrbitTrack = function(context, config) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultMoonOrbitTrackConfig);
	this.context = context;
	var scope = this;
	
	var nodes = [];
	for (var i = 0; i < 360; i++) {
		nodes[i] = 0;
	}
	
	var track;
	var lastDegree = 0;
	var trackLength = 350;
	var fadeStarts = 270;
	

	this.reset = function() {
		for (var i = 0; i < 360; i++) {
			nodes[i] = 0;
		}
	};
	
	
	this.setNode = function(angle, distance) {
		if (angle >= 0 && angle < 360) {
			nodes[Math.round(angle)] = distance;	
			lastDegree = angle;
		}
	};
	
	function buildTrack() {
		var geometry = new THREE.Geometry();
		var points = [];
		var alphas = [];
		
		var from = Math.ceil(lastDegree - trackLength);
		var to = Math.round(lastDegree);

		//for (var i = 0; i < nodes.length; i++) {
		for (var i = from; i <= to; i++) {
			
			var alpha = (i - from) / ((to - fadeStarts) - from);
			if (alpha > 1) {
				alpha = 1.0;
			}
			var angle = KMG.Math.clamp(i, 360);
			//console.info([from, angle, to]);
			var posX = (config.radius) * (nodes[Math.round(angle)] / config.apogeeDistance);
			if (posX > 0) {
				var position = new THREE.Vector3(posX, 0, 0);
				position.rotateZ(i * KMG.PI_BY_180);
				geometry.vertices.push(position);
				alphas.push(alpha);
			}
		}
		
		
		var shader = KMG.OrbitTrackShader;
		var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

		uniforms[ "color" ].value = KMG.Util.rgbToArray(config.color);
		uniforms[ "uThickness" ].value = config.lineThickness;
		
		var attributes = {
			alpha: { type: 'f', value: alphas },
		};
		
		var material = new THREE.ShaderMaterial( {
			uniforms:       uniforms,
			attributes:     attributes,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader,
			transparent:    true
		});
		material.linewidth = config.lineThickness;
		

		//var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : true, fog : false, color : config.color, linewidth:config.lineThickness } );
		var track = new THREE.Line( geometry,  material);

		return track;
	}

	this.recreateTrack = function() {
		
		if (track) {
			this.remove(track);
		}
		
		track = buildTrack();
		track.position.z = -990 * modelOptions.kmScalar;
		this.add( track );
		
		this.setShadowInteraction(false);
		
	};
	
	this.update = function() {

	};
};
KMG.MoonOrbitTrack.prototype = Object.create( KMG.BaseObject.prototype );



KMG.OrbitTrackShader = {

	uniforms: THREE.UniformsUtils.merge( [
		{
			"uThickness" : { type: "f", value: 2.0 },
			"alpha": { type: "f", value: 1.0 },
			"color" : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
		}]),

	vertexShader: [
		'attribute float alpha;',
		'varying float vAlpha;',
		'uniform float uThickness;',
		'void main() {',
		'	vAlpha = alpha;',
		'	gl_PointSize = uThickness;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join("\n"),

	fragmentShader: [

		'uniform vec3 color;',
		'varying float vAlpha;',
		'varying float uThickness;',
		'void main() {',
		'	gl_FragColor = vec4( color, vAlpha );',
		'}'
	].join("\n")

};

/* File: SunlightPositionIndicator.js */


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
