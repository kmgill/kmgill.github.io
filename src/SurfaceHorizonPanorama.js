KMG.DefaultSurfaceHorizonPanoramaConfig = {
	radius: 1000.0,
	texture : "/img/panoramas/Moon-ApolloPanorama-2048-trans.png",
	color : 0xFF0000,
	opacity : 0.5,
	lineThickness : .5,
	kmScalar : 1.0
};


KMG.SurfaceHorizonPanorama = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSurfaceHorizonPanoramaConfig)
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
	
	this.secondaryContainer = new THREE.Object3D();
	
	var tDiffuse = KMG.TextureMap.loadTexture(config.texture);
	tDiffuse.format = THREE.RGBAFormat;
	
	var geometry = new THREE.CylinderGeometry( config.radius, config.radius, 1000, 32, 2, true );
	var material = new THREE.MeshLambertMaterial( {color: 0xffffff,
													wireframe : false,
													side : THREE.BackSide,
													map:tDiffuse,
													transparent : true
													} );
	var cylinder = new THREE.Mesh( geometry, material );
	cylinder.rotation.x = -KMG.RAD_90;
	//this.secondaryContainer.add(cylinder);
	
	var grid = new THREE.Object3D();
	grid.add(createRing(0.0, config.lineThickness));
	this.secondaryContainer.add(grid);
	
	this.add(cylinder);
	
	this.add(this.secondaryContainer);
	
	this.scale.set( config.kmScalar, config.kmScalar, config.kmScalar );	
	
	this.update = function() {
		
	};
};
KMG.SurfaceHorizonPanorama.prototype = Object.create( KMG.BaseObject.prototype );