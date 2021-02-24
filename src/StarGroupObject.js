
KMG.StarGroupObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	
	this.starObjects = new Array();
	for (var i = 0; i < 10; i++) {
		var starObject = new KMG.StarsObject(this.context, this.config);
	
		this.starObjects[this.starObjects.length] = starObject;
		this.add(starObject);
	}

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		for (var i = 0; i < 10; i++) {
			this.starObjects[i].update();
			var isVisible = i < this.config.starQuantity && this.config.backgroundType === "stars";
			this.starObjects[i].traverse(function(stars) {
				stars.visible = isVisible;
			});
		}
	
	};
};
KMG.StarGroupObject.prototype = Object.create( KMG.BaseObject.prototype );
