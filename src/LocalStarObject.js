
KMG.DefaultLocalStarConfig = {
	localStarDistance : 1.0,
	displayLocalStar : true,
	localStarTexture : KMG.starFlares[0].name,
	localStarColor : [ 255, 255, 255 ],
	starColorAffectsPlanetLighting : true
};

KMG.LocalStarObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultLocalStarConfig);
	this.context = context;
	var scope = this;
	
	
	var star = new THREE.Object3D();

	var material = new THREE.SpriteMaterial({fog : false
											, color : 0xFFFFFF
											, sizeAttenuation : false
											, transparent : true
											, blending : THREE.AdditiveBlending
											, useScreenCoordinates: false
											, depthWrite: false
											, depthTest: true
											});

	var sprite = new THREE.Sprite(material);

	star.add(sprite);
	
	this.add(star);
		
	function getPosition(type, direction) {
		var position = null;
		
		if (type === "Directional") {
			position = new THREE.Vector3(-5000.0, 0, 0);
			position.rotateY(direction*(Math.PI/180.0));
		} else {
			position = new THREE.Vector3(0, 0, 0);
		}

		return position;
	}
	
	this.update = function()
	{
		//if (!this.context.configChanged) 
		//	return;
		
		var texDefinition = KMG.TextureMap.getFlareDefinitionByName(scope.config.localStarTexture);
		var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		tDiffuse.wrapS = tDiffuse.wrapT = THREE.ClampToEdgeWrapping;
		tDiffuse.format = THREE.RGBAFormat;
		tDiffuse.needsUpdate = true;

		var starColor = KMG.Util.arrayToColor(config.localStarColor);
		
		
		material.map = tDiffuse;
		material.color = starColor;
		
		sprite.position = getPosition(this.config.lightingType, this.config.sunlightDirection);

		sprite.scale.set( 100 * this.config.localStarDistance, 100 * this.config.localStarDistance, 1 );
		
		
		this.traverse(function(obj) {
			obj.visible = scope.config.displayLocalStar;
		});
		
		sprite.updateMatrix();
		star.updateMatrix();
	};
	this.update();
};
KMG.LocalStarObject.prototype = Object.create( KMG.BaseObject.prototype );


