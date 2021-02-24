
KMG.DefaultOrbitingPlanetConfig = {
	kmScalar : 0.000005,
	radius : 6000,
	speed : 1,
	showRing : false,
	texture : "",
	orbiting : null,
	name : "",
	type : "major",
	dotSize : 2,
	planetEmissive : 0x000000,
	focusPoint : new THREE.Vector3(0, 0, 0)
};

KMG.OrbitingPlanet = function ( context, config, orbit, tickController, iauRotation ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultOrbitingPlanetConfig);
	var scope = this;
	this.context = context;
	this.orbit = orbit;
	this.iauRotation = iauRotation;
	this.tickController = tickController;
	
	var orbitScale = KMG.AU_TO_KM * this.config.kmScalar;

	var planetConfig = {};//KMG.Util.clone(ephemeris);
	planetConfig.scale = orbitScale;
	planetConfig.segments = 128;
	planetConfig.opacity = (this.config.type == "major") ? 0.6 : 0.3;
	planetConfig.color = (this.config.type == "major") ? 0x304FFF : 0x304FFF;
	planetConfig.lineThickness = 1.5;

	var orbitPathLine = new KMG.OrbitPathLine(context, planetConfig, orbit, this.config.orbiting);
	this.add(orbitPathLine);
	
	
	var sphereConfig = {radius:config.radius, fog:false, scale:config.kmScalar, texture:config.texture, color:0xFFFFFF, emissive:config.planetEmissive};
	var planet = new KMG.TexturedSphereObject(context, sphereConfig);
	this.planet = planet;
	this.add(planet);
	
	var dotConfig = {
		opacity : 1.0,
		color : 0xFFFFFF,
		size : config.dotSize,
		texture : 'img/sprites/circle_50x50.png'
	};
	
	var planetDot = new KMG.DotPlotObject(context, dotConfig);
	this.add(planetDot);
	
	var orbitals = [planetDot, planet];
	var label;

	var label =  $("<div/>").attr("id", "name-label-" + this.config.name)
							.addClass("scene-object-label")
							.text(this.config.name)
							.css("display", (this.config.type == "major") ? "inline-block" : "none")
							.appendTo('body');
	
	
	
	var ring;
	if (this.config.showRing) {
		ring = new KMG.RingObject(context, {
			ringInnerRadius : 74500 * this.config.kmScalar,
			ringOutterRadius : 140220 * this.config.kmScalar,
			targetObject : planet,
			displayRing : true
		});
		this.add(ring);
		orbitals.push(ring);
	}
	
	var orbiter = new KMG.EllipticalOrbiter(context, orbitals, orbitScale, this.config.speed, orbit, this.config.orbiting, tickController);
	this.orbiter = orbiter;
	this.planet.orbiter = orbiter;

	this.update = function() {
		
		if (planet) {
			planet.update();
		}
		
		if (ring) {
			ring.update();
		}
		
		if (planetDot) {
			planetDot.update();
		}
		
		if (orbitPathLine) {
			orbitPathLine.update();
		}
		
		// Label...
		var projector = new THREE.Projector();
		
		
		var pos = planet.position.clone().add(config.focusPoint);

		projector.projectVector( pos, context.camera );

		var x =  (pos.x + 1) / 2 * window.innerWidth - (label.width() / 2);
		var y = (-pos.y + 1) / 2 * window.innerHeight;

		label.css("top", parseInt(y) + "px");
		label.css("left", parseInt(x) + "px");
		
		if (pos.z > 1) {
			label.css("display", "none");
		} else {
			label.css("display", "inline-block");
		}
		
		
		// Rotator...
		if (this.iauRotation) {
			var rotationalQ = this.iauRotation.computeRotationalQuaternion(this.tickController.tickJulian);

			planet.sphereMesh.rotation.setFromQuaternion(rotationalQ);
			planet.updateMatrix();
			
			if (ring) {
				ring.rotation.setFromQuaternion(rotationalQ);
				ring.updateMatrix();
			}
		}
		
		
	};
	
	
	this.onMousePosition = function(x, y) {
		
	
		if (!label || this.config.type != "minor") {
			return;
		}
		var mouseOverRadius = 0.033;
		var projector = new THREE.Projector();
		var vector = new THREE.Vector3( x, y, 1 );
		
		var pos = planet.position.clone().add(config.focusPoint);

		projector.projectVector( pos, context.camera );
		if (vector.distanceTo(pos) <= mouseOverRadius) {
			label.css("display", "inline-block");
		} else {
			label.css("display", "none");
		}
	
	};
};
KMG.OrbitingPlanet.prototype = Object.create( KMG.BaseObject.prototype );
	
