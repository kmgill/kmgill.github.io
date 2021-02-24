KMG.DefaultConstellationLinesConfig = {
	
	color : 0x12110C,
	radius : 90000.0,
	opacity : 0.45,
	lineThickness : 1.0
	
};

KMG.ConstellationLines = function ( context, config, onLoaded ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultConstellationLinesConfig);
	this.context = context;
	var scope = this;

	
	function buildPoint(point) {
		
		var coords = KMG.Math.convertEquatorialToEcliptic(point[0] * 15, point[1]);
		var vertex = KMG.Math.getPoint3D(coords.l, coords.b, config.radius);
		
		return vertex;
	}
	
	function buildPath(path) {
		
		var geometry = new THREE.Geometry();
		
		for (var i = 0; i < path.length; i++) {
			var point = path[i];
			var vertex = buildPoint(point);
			
			geometry.vertices.push( vertex );
			
		}
		
		var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : true, fog : false, color : config.color, linewidth:config.lineThickness } );
		var line = new THREE.Line( geometry,  material);

		return line;
	}
	
	function buildConstellation(constellation) {
		
		var const3d = new THREE.Object3D();
		
		for (var i = 0; i < constellation.length; i++) {
			var path = constellation[i];
			var path3d = buildPath(path);
			const3d.add(path3d);
		}
		
		return const3d;
		
	}
	
	
	$.ajax({
		url: "/api/constellations/list/",
		dataType: "json",
		error: function( jqXHR, textStatus, errorThrown ) {
			console.warn("Error: " + errorThrown);
		
		},
		success: function(data, textStatus, jqxhr) {
			
		}
	}).done(function(data) {

		console.info("Adding " + data.length + " constellations");
		
		for (var i = 0; i < data.length; i++) {
			
			scope.add(buildConstellation(data[i]));

		}
		
		if (onLoaded) {
			onLoaded(scope);
		}
	
	});
	
	

	
	this.update = function() {
		
		
	};
};
KMG.ConstellationLines.prototype = Object.create( KMG.BaseObject.prototype );

