KMG.DefaultFadingVectorPathLineConfig = {
	scale : 5,
	opacity : 0.75,
	transparent : true,
	color : 0xFFFFFF,
	segments : 200,
	subdivisions : 17,
	lineThickness : 1.0,
	fadeLength : 500
};


/**
 * Vectors: an array of objects containing x/y/z values in terms of AU
 */
KMG.FadingVectorPathLine = function ( context, config, centerObject, vectors ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultFadingVectorPathLineConfig);
	this.context = context;
	var scope = this;
	this.centerObject = centerObject;
	
	

	var geometry = new THREE.Geometry();
	var points = [];
	console.info("Adding " + vectors.length + " vectors");
	for (var i = vectors.length - config.fadeLength; i < vectors.length; i++) {
		if (i < 0)
			continue;
		var vector = vectors[i];
		points.push(new THREE.Vector3(vector.x, vector.z, -vector.y));
	}
	
	
	var splineLength = points.length * config.subdivisions;
	
	var alphas = [];
	var spline = new THREE.SplineCurve3( points );
	for (var i = 0; i <= splineLength; i++) {
		var f = i / splineLength;
		var position = spline.getPoint(f);
		geometry.vertices.push(new THREE.Vector3( position.x, position.y, position.z ));
		alphas.push(f);
	}

	var shader = KMG.FadingTrackShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "color" ].value = KMG.Util.rgbToArray(config.color);
	uniforms[ "uThickness" ].value = config.lineThickness;
	
	var attributes = {
		alpha: { type: 'f', value: alphas }
	};
	
	var material = new THREE.ShaderMaterial( {
		uniforms:       uniforms,
		attributes:     attributes,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent:    true
	});
	material.linewidth = config.lineThickness;
	
	var line = new THREE.Line( geometry,  material);
	line.position.set( 0, 0, 0 );
	line.scale.set( config.scale, config.scale, config.scale );	
	this.add( line );
	
	this.lineMaterial = material;
	
	this.setLineColor = function(color) {
		uniforms[ "color" ].value = KMG.Util.rgbToArray(color);
	};
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;

		if (scope.centerObject) {
			var centerPosition = scope.centerObject.position.clone();
			this.position = centerPosition;
		}
	};

};
KMG.FadingVectorPathLine.prototype = Object.create( KMG.BaseObject.prototype );



KMG.FadingTrackShader = {

	uniforms: THREE.UniformsUtils.merge( [
		{
			"uThickness" : { type: "f", value: 2.0 },
			"alpha": { type: "f", value: 1.0 },
			"color" : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }
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
