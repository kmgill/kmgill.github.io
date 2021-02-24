
KMG.DefaultCoordinateGridConfig = {
	radius: 90000.0,
	color : 0x006600,
	opacity : 0.5,
	lineThickness : .5,
	scale : 1.0
};

KMG.CoordinateGrid = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultCoordinateGridConfig)
	var scope = this;
	
	
	
	function createRing(latitude, width) {
		if (!latitude) {
			latitude = 0;
		}
		var geometry = new THREE.Geometry();
		for (var i = 0; i <= 360; i+=0.25) {
			
			var vertex = KMG.Math.getPoint3D(i, latitude, config.radius);
			geometry.vertices.push(vertex);
			
		};

		var material = new THREE.LineBasicMaterial( { opacity: config.opacity, transparent : true, fog : false, color : config.color, linewidth: width } );
		var line = new THREE.Line( geometry,  material, THREE.LineStrip);
		line.position.set( 0, 0, 0 );
		return line;
	}
	
	
	function createGrid() {
		var grid = new THREE.Object3D();
		
		for (var i = 0; i < 360; i+=10) {
			
			var ring = createRing(0, config.lineThickness);
			ring.rotation.z = KMG.RAD_90;
			ring.rotation.y = i * KMG.PI_BY_180;
			
			grid.add(ring);
		}
		
		for (var i = -90; i < 90; i+=10) {
			var ring = createRing(i, config.lineThickness);
			grid.add(ring);
		}
		
		return grid;
	}
	
	this.secondaryContainer = new THREE.Object3D();
	
	var ring = createRing(0, config.lineThickness+1);
	this.secondaryContainer.add( ring );
	var grid = createGrid();
	this.secondaryContainer.add(grid);
	this.add(this.secondaryContainer);
	
	this.scale.set( config.scale, config.scale, config.scale );	
	
	// Grid specific. Leaves the ecliptic ring showing to be controlled by the general object's visibility
	this.setGridVisibility = function(visible) {
		grid.setVisibility(visible);
	}
	
	
	this.update = function() {
		
	};
};
KMG.CoordinateGrid.prototype = Object.create( KMG.BaseObject.prototype );
