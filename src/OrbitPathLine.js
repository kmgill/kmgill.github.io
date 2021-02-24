

KMG.DefaultBasicOrbitPathLineConfig = {

	distance : 1.0,
	opacity : 0.75,
	transparent : true,
	color : [ 255, 255, 255 ]

};

KMG.BasicOrbitPathLine = function ( context, config) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultBasicOrbitPathLineConfig);
	this.context = context;
	var scope = this;

	var segments = 60;
	var radius = 1000;
	var size = 360 / segments;

	var geometry = new THREE.Geometry();

	for ( var i = 0; i <= segments; i ++ ) {
		var segment = ( i * size ) * Math.PI / 180;
		geometry.vertices.push( new THREE.Vector3( Math.cos( segment ) * radius, 0, Math.sin( segment ) * radius )  );
	}
	
	var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : config.transparent, fog : false, linewidth: 1 } );
	
	var line = new THREE.Line( geometry,  material);
	line.position.set( 0, 0, 0 );

	this.add( line );
	
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
		
		var color = KMG.Util.arrayToColor(config.color);
		material.color = color;
		material.opacity = config.opacity;
		
		line.scale.set( config.distance, config.distance, config.distance );
	};
};
KMG.BasicOrbitPathLine.prototype = Object.create( KMG.BaseObject.prototype );


KMG.DefaultOrbitPathLineConfig = {
	scale : 5,
	opacity : 0.55,
	transparent : true,
	color : 0xFFFFFF,
	segments : 100,
	closeOrbit : true,
	subdivisions : 12,
	lineThickness : 1.0
};
KMG.DefaultOrbitPathLineConfig = KMG.Util.extend(KMG.DefaultOrbitPathLineConfig, KMG.OrbitDefinitions.template);

KMG.OrbitPathLine = function ( context, config, orbit, centerObject, start /* Julian Days */, stop /* Julian Days */) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultOrbitPathLineConfig);
	this.context = context;
	var scope = this;
	
	this.centerObject = centerObject;
	

	var julianPeriod = orbit.period;
	
	var epoch = (orbit.epoch) ? orbit.epoch : 2451545;
	var startTime = (start) ? start : epoch;
	var stopTime = (stop) ? stop : startTime + julianPeriod;
	
	
	var segments = config.segments;
	var d = (stopTime - startTime) / segments;
	var geometry = new THREE.Geometry();
	
	var first = null;
	
	var curve = new THREE.CurvePath();
	var points = [];
	for (var t = startTime; t <= stopTime-d; t += d) {
		var p = orbit.positionAtTime(t);
		points.push(p);
		if (!first) {
			first = p;
		}
	}
	
	//if (config.closeOrbit) {
	//	points.push(first);
	//}
	
	var spline = new THREE.Spline( points );
	for (var i = 0; i < points.length * config.subdivisions; i ++ ) {
		var index = i / ( points.length * config.subdivisions );
		var position = spline.getPoint( index );
		geometry.vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );
	
	}
	
	if (config.closeOrbit) {
		var position = spline.getPoint( 0 );
		geometry.vertices.push(new THREE.Vector3( position.x, position.y, position.z));
	}
	
	/*
	var shader = KMG.OrbitLineShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "color" ].value = KMG.Util.rgbToArray( config.color);
	uniforms[ "uThickness" ].value = config.lineThickness;
	uniforms[ "alpha" ].value = config.opacity;
	var attributes = { };
	
	var material = new THREE.ShaderMaterial( {
				uniforms:       uniforms,
				attributes:     attributes,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader,
				transparent : true
			});
	*/
	
	var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : true, fog : false, color : config.color, linewidth: config.lineThickness } );
	var line = new THREE.Line( geometry,  material, THREE.LineStrip);
	line.position.set( 0, 0, 0 );
	line.scale.set( config.scale, config.scale, config.scale );	
	this.add( line );

	this.lineMaterial = material;

	this.update = function()
	{
		if (scope.centerObject) {
			var centerPosition = scope.centerObject.position.clone();
			this.position = centerPosition;
		}
		
		if (!this.context.configChanged) 
			return;
		
		//uniforms[ "color" ].value = KMG.Util.rgbToArray( config.color);
		//uniforms[ "alpha" ].value = config.opacity;
		
		this.traverse(function(obj) {
			obj.visible = (config.opacity != 0);
		});

		line.scale.set( config.scale, config.scale, config.scale );	
	};
};
KMG.OrbitPathLine.prototype = Object.create( KMG.BaseObject.prototype );










