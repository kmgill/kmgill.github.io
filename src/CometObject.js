
KMG.DefaultCometObjectConfig = {
	lookingTowards : null
};

KMG.CometObject = function ( context, config, ephemeris, tickController, centerObject, lookingTowards ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultCometObjectConfig);
	var scope = this;
	
	this.lookingTowards = (config.lookingTowards) ? config.lookingTowards : { position: new THREE.Vector3(0, 0, 0) };
	
	var cometTexture = KMG.TextureMap.loadTexture("/img/basic-comet-3-trans.png");
	cometTexture.wrapS = cometTexture.wrapT = THREE.ClampToEdgeWrapping;
	cometTexture.format = THREE.RGBAFormat;
	cometTexture.needsUpdate = true;
	
	function createFaceMesh(rotate) {

		var geometry = new THREE.PlaneGeometry(400, 100, 10, 10);
		var materialOptions = { color: 0xFFFFFF
							, ambient : 0xFFFFFF
							, emissive : 0xAAAAAA
							, shading : THREE.NoShading
							, map : cometTexture
							, transparent : true
							, side: THREE.DoubleSide
							, blending : THREE.AdditiveBlending
							, depthWrite: false
							, depthTest: false
							};
		var mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial( materialOptions ));
		
		mesh.rotation.set(rotate, KMG.RAD_90, 0, 'YXZ');
		mesh.position.z -= 160;

		return mesh;
	}

	this.add(createFaceMesh(0));
	this.add(createFaceMesh(-KMG.RAD_90));
	this.add(createFaceMesh(-KMG.RAD_45));
	this.add(createFaceMesh(KMG.RAD_45));

	this.update = function() {

		if (this.lookingTowards && this.lookingTowards.position) {
			var lookAt = this.lookingTowards.position.clone();
			this.lookAt( lookAt );
		}
		
	};
};
KMG.CometObject.prototype = Object.create( KMG.BaseObject.prototype );
	
	
