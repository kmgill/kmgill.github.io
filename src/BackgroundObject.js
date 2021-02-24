
KMG.DefaultBackgroundConfig = {
	backgroundType : 'stars',
	backgroundImage : 'Starfield',
	backgroundImageType : 'flat',
	backgroundImageFitType : 'stretch',
	starQuantity : 3.5, // 0 - 10
	noStars : false
};

KMG.BackgroundObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultBackgroundConfig);
	this.context = context;
	var scope = this;
	
	
	this.starsConfig = {
		alphaMultiplier : 2.0
	};
	// Create Stuff
	if (!config.noStars) {
		this.stars = new KMG.CatalogStarsObject(context, this.starsConfig);
		this.add(this.stars);
	}
	
	this.imageSphere = new KMG.BackgroundImageSphereObject(context, config);
	this.imageFlat = new KMG.BackgroundImageSpriteObject(context, config);
	
	
	this.add(this.imageSphere);
	this.add(this.imageFlat);
	
	
	this.setShadowInteraction(false);
	
	this.update = function()
	{
	
		this.starsConfig.sizeMultiplier = scope.config.starQuantity;
	
		//if (scope.config.backgroundType === "stars") {
		if (this.stars) {
			this.stars.update();
		}
		//}
		
		if (scope.config.backgroundType === "image" && scope.config.backgroundImageType === "sphere") {
			this.imageSphere.update();
		}
		
		if (scope.config.backgroundType === "image" && scope.config.backgroundImageType === "flat") {
			this.imageFlat.update();
		}
		
		if (!this.context.configChanged) 
			return;
		
		// Handled within StarGroupObject object
		//this.stars.traverse(function(obj) {
		//
		//});
		
		this.imageSphere.traverse(function(obj) {
			obj.visible = (scope.config.backgroundType === "image" && scope.config.backgroundImageType === "sphere");
		});
		
		this.imageFlat.traverse(function(obj) {
			obj.visible = (scope.config.backgroundType === "image" && scope.config.backgroundImageType === "flat");
		});
	};
};
KMG.BackgroundObject.prototype = Object.create( KMG.BaseObject.prototype );
