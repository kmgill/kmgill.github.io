
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
