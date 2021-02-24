KMG.DefaultVectorPathLineConfig = {
	scale : 5,
	opacity : 0.75,
	transparent : true,
	color : 0xFFFFFF,
	segments : 100,
	subdivisions : 6,
	lineThickness : 1.0
};


/**
 * Vectors: an array of objects containing x/y/z values in terms of AU
 */
KMG.VectorPathLine = function ( context, config, centerObject, vectors ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultVectorPathLineConfig);
	this.context = context;
	var scope = this;
	this.centerObject = centerObject;
	
	
	
	var geometry = new THREE.Geometry();
	var points = [];
	console.info("Adding " + vectors.length + " vectors");
	for (var i = 0; i < vectors.length; i++) {
		var vector = vectors[i];
		points.push(new THREE.Vector3(vector.x, vector.z, -vector.y));
	}

	var spline = new THREE.Spline( points );
	for ( i = 0; i < points.length * config.subdivisions; i ++ ) {
		var index = i / ( points.length * config.subdivisions );
		var position = spline.getPoint( index );
		geometry.vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );
	
	}
	
	var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : true, fog : false, color : config.color, linewidth:config.lineThickness } );
	var line = new THREE.Line( geometry,  material);
	line.position.set( 0, 0, 0 );
	line.scale.set( config.scale, config.scale, config.scale );	
	this.add( line );

	this.setLineColor = function(color) {
		material.color = new THREE.Color(color);
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
KMG.VectorPathLine.prototype = Object.create( KMG.BaseObject.prototype );
