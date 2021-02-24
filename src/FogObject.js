
KMG.FogObject = function ( context, config ) {
	
	var e = KMG.Util.surfaceDistance(context, config.radius);
	
	THREE.Fog.call( this, 0xAAAAAA, e, e + config.radius );
	this.config = config;
	this.context = context;
	var scope = this;

	this.uniforms = null;
	this.mesh = null;
	this.material = null;
	this.geometry = null;

	
	this.update = function()
	{
	
		var radius = this.config.radius * this.context.controls.scale;
		var distanceToCenter = KMG.Util.eyeDistanceToCenter(this.context);
		var surfaceDist = KMG.Util.surfaceDistance(this.context, this.config.radius);

		var near = distanceToCenter - radius;
		var far = KMG.Util.horizonDistance(this.context, this.config.radius);

		
		var intensityFactor = -1 * (this.config.atmosphereIntensity - 1.0);
		near = near + ((far - near) * intensityFactor);

		this.far = far;
		this.near = near;
		
		if (this.context.configChanged) {
			var color = KMG.Util.arrayToColor(this.config.atmosphereColor);
			color
			this.color = color;
			
			if (!this.config.displayAtmosphere) {
				//var color = new THREE.Color(0x000000);
				//this.color = color;
				//this.near = 0.1;
				//this.far = 100000000000;
				
			} else {
				//this.context.primaryScene.fog = this;
			}
		}
			
			
	};
};
KMG.FogObject.prototype = Object.create( THREE.Fog.prototype );
