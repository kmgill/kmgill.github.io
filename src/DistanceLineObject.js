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
