KMG.DefaultAxisLinesConfig = {
	radius: 200,
	ringRadius: 200,
	ringWidth : 5
};


KMG.AxisLinesObject = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultAxisLinesConfig);
	this.context = context;
	var scope = this;
	

	var tex = KMG.TextureMap.loadTexture("/img/BrushedMetal.jpg");
	tex.format = THREE.RGBAFormat;
	
	function createLine(length, width) {
		var line = new THREE.Mesh( new THREE.CylinderGeometry(width*.5, width*.5, length*2, 360, 1, false),
								 new THREE.MeshLambertMaterial({
										ambient		: 0x444444,
										color		: 0xAAAAAA,
										specular	: 0xEEEEEE,
										shininess	: 150, 
										shading		: THREE.SmoothShading,
										transparent: false,
										side: THREE.DoubleSide,
										map : tex,
										fog : false,
										opacity : 1.0
									}) );
		line.castShadow = false;
		line.receiveShadow = false;
		return line;
	}
	
	var radius = (config.radius) ? config.radius : 2200 * modelOptions.kmScalar;
	
	var axisLineY = createLine(radius, config.ringWidth);
	this.add(axisLineY);
	
	var axisLineX = createLine(radius, config.ringWidth);
	axisLineX.rotation.x = KMG.RAD_90;
	this.add(axisLineX);
	
	var axisLineZ = createLine(radius, config.ringWidth);
	axisLineZ.rotation.z = KMG.RAD_90;
	this.add(axisLineZ);

	function createAxisRing(radius, ringWidth) {
		
		var ring = new THREE.Object3D();
			
		
		ring.add(new THREE.Mesh( new THREE.CylinderGeometry(radius, radius, ringWidth, 360, 1, true),
								 new THREE.MeshLambertMaterial({
										ambient		: 0x444444,
										color		: 0xAAAAAA,
										specular	: 0xC0C0C0,
										shininess	: 150, 
										shading		: THREE.SmoothShading,
										transparent: false,
										side: THREE.FrontSide,
										fog : false,
										map : tex,
										opacity : 1.0
									}) ));
		
		ring.add(new THREE.Mesh( new THREE.CylinderGeometry(radius*0.98, radius*0.98, ringWidth, 360, 1, true),
								 new THREE.MeshLambertMaterial({
										ambient		: 0x444444,
										color		: 0xAAAAAA,
										specular	: 0xC0C0C0,
										shininess	: 150, 
										shading		: THREE.SmoothShading,
										transparent: false,
										side: THREE.BackSide,
										fog : false,
										map : tex,
										opacity : 1.0
									}) ));
								
									
		var material = new THREE.MeshLambertMaterial({
									ambient		: 0x444444,
									color		: 0xAAAAAA,
									specular	: 0xC0C0C0,
									shininess	: 150, 
									shading		: THREE.SmoothShading,
									transparent: false,
									side: THREE.FrontSide,
									fog : false,
									map : tex,
									opacity : 1.0
									
								});

		var geometry = new THREE.RingGeometry2( radius*0.98, radius, 180, 1, 0, Math.PI * 2);
		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.x = KMG.RAD_90;
		mesh.position.y = -ringWidth * 0.5;
		ring.add(mesh);
		
		
		var material = new THREE.MeshLambertMaterial({
									ambient		: 0x444444,
									color		: 0xAAAAAA,
									specular	: 0xC0C0C0,
									shininess	: 150, 
									shading		: THREE.SmoothShading,
									transparent: false,
									side: THREE.BackSide,
									fog : false,
									map : tex,
									opacity : 1.0
									
								});
								
		var geometry = new THREE.RingGeometry2( radius*0.98, radius, 180, 1, 0, Math.PI * 2);
		geometry.computeFaceNormals();
		
		var mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.x = KMG.RAD_90;
		mesh.position.y = ringWidth * 0.5;
		ring.add(mesh);
		
		
		
		
		return ring;
	}

	
	var xRing = createAxisRing(config.ringRadius, config.ringWidth);
	xRing.rotation.z = KMG.RAD_90;
	this.add(xRing);
	
	
	var zRing = createAxisRing(config.ringRadius, config.ringWidth);
	zRing.rotation.x = KMG.RAD_90;
	this.add(zRing);
	
	
	var yRing = createAxisRing(config.ringRadius, config.ringWidth);
	this.add(yRing);
	
	
	this.setShadowInteraction(false);

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
	}
};
KMG.AxisLinesObject.prototype = Object.create( KMG.BaseObject.prototype );
