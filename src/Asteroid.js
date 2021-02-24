/*
function addOrbitingAsteroid(context, orbitConfig, speed, f, tickController) {
	
	var orbitScale = KMG.AU_TO_KM * modelOptions.kmScalar;
	
	var orbitConfig = KMG.Util.clone(orbitConfig);
	orbitConfig.scale = orbitScale;
	orbitConfig.segments = 512;
	orbitConfig.opacity = 0.1;
	orbitConfig.color = 0x00FF00;

	var dotConfig = {
		opacity : 0.1,
		color : 0xFFFFFF,
		//size : 40,
		//texture : 'img/sprites/vesta.png'
		texture : 'img/sprites/circle_50x50.png'
	};
	
	var asteroid;
	
	if (orbitConfig.name != "(2013 NJ)") {
		asteroid = new KMG.DotPlotObject(context, dotConfig);
	} else {
		var config = KMG.Util.extend({radius:200, fog:false, scale:modelOptions.kmScalar, texture:"asteroid", color:0xDDDDDD}, KMG.DefaultTexturedSphereOptions);
		asteroid = new KMG.TexturedSphereObject(engine.context, config);
	}
	addToPrimaryScene(asteroid);
	
	var orbitPathLine = new KMG.OrbitPathLine(context, orbitConfig);
	addToPrimaryScene(orbitPathLine);
	var orbiter = new KMG.EllipticalOrbiter(context, asteroid, orbitScale, speed, orbitConfig, null, tickController);
	
	asteroid.orbitConfig = orbitConfig;
	asteroid.nameSprite = null;
	asteroid.orbitPathLine = orbitPathLine;
	asteroids.push(asteroid);
}
*/

KMG.AsteroidObject = function(context, ephemeris, speed, tickController, config) {
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	var scalar = KMG.AU_TO_KM * config.kmScalar;
	
	var orbitConfig = KMG.Util.clone(ephemeris);
	orbitConfig.scale = scalar;
	orbitConfig.segments = 512;
	orbitConfig.opacity = 0.1;
	orbitConfig.color = 0x00FF00;
	
	
	var dotConfig = {
		opacity : 0.1,
		color : 0xFFFFFF,
		texture : 'img/sprites/circle_50x50.png'
	};
	
	
	var asteroid;
	
	if (orbitConfig.name != "(2013 NJ)") {
		asteroid = new KMG.DotPlotObject(context, dotConfig);
	} else {
		var config = KMG.Util.extend({radius:200, fog:false, scale:modelOptions.kmScalar, texture:"asteroid", color:0xDDDDDD}, KMG.DefaultTexturedSphereOptions);
		asteroid = new KMG.TexturedSphereObject(context, config);
	}
	this.add(asteroid);
	
	var orbitPathLine = new KMG.OrbitPathLine(context, orbitConfig);
	this.add(orbitPathLine);
	
	var orbiter = new KMG.EllipticalOrbiter(context, asteroid, scalar, speed, orbitConfig, null, tickController);
	this.orbitConfig = orbitConfig;
	this.nameSprite = null;
	this.orbitPathLine = orbitPathLine;

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			

	};
};
KMG.AsteroidObject.prototype = Object.create( KMG.BaseObject.prototype );
