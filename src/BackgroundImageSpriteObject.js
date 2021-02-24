

KMG.BackgroundImageSpriteObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;

	
	var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(scope.config.backgroundImage);
	var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;

	var material = new THREE.SpriteMaterial({
								shading		: THREE.SmoothShading,
								map			: tDiffuse,
								fog			: false,
								useScreenCoordinates : true,
								alignment: THREE.SpriteAlignment.topLeft,
								blending: THREE.AdditiveBlending
							});
	
	var sprite = new THREE.Sprite( material );
	sprite.position.set( 0, 0, -1000 );
	sprite.scale.set( 1000, 1000, 1 );

	this.sprite = sprite;
	this.material = material;
	
	this.add(sprite);
	
	this.update = function()
	{

		if (this.config.backgroundImageFitType === "stretch") {
			this.sprite.scale.set(this.context.containerWidth, this.context.containerHeight, 1);
		} /*else if (this.config.backgroundImageFitType === "center") {
		
		} else if (this.config.backgroundImageFitType === "fill") {
		
		} else if (this.config.backgroundImageFitType === "fit") {
		
		}*/
		
		if (!this.context.configChanged) 
			return;
			
		var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(scope.config.backgroundImage);
		
		
		var tDiffuse = null;
		if (texDefinition.name == "Webcam") {
			tDiffuse = texDefinition.texture;
		} else {
			tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		}
		//var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		
		this.material.map = tDiffuse;
	};
};
KMG.BackgroundImageSpriteObject.prototype = Object.create( KMG.BaseObject.prototype );
