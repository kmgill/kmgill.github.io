
var tex = {
	name : "",
	texture : "",
	bumpMap : "",
	normalMap : "",
	specularMap : "",
	enabled : true
};

KMG.textures.push(KMG.Util.extend({ name : "asteroid", texture : "/img/planets_small/asteroid.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "sun", texture : "/img/planets_small/sun.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "mercury", texture : "/img/planets_small/mercury.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "venus", texture : "/img/planets_small/venus.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "earth", texture : "/img/planets_small/earth-true.jpg", specularMap : "/img/earth_specularmap_flat_1024x512.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "moon", texture : "/img/planets_small/moon.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "mars", texture : "/img/tx_composite.adjusted.1024x512.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "phobos", texture : "/img/planets_small/phobos.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "deimos", texture : "/img/planets_small/deimos.jpg"}, tex));

KMG.textures.push(KMG.Util.extend({ name : "asteroid", texture : "/img/planets_small/asteroid.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "jupiter", texture : "/img/planets_small/jupiter.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "callisto", texture : "/img/planets_small/callisto.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "io", texture : "/img/planets_small/io.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "ganymede", texture : "/img/planets_small/ganymede.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "europa", texture : "/img/planets_small/europa.jpg"}, tex));

KMG.textures.push(KMG.Util.extend({ name : "saturn", texture : "/img/planets_small/saturn.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "titan", texture : "/img/planets_small/titan.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "mimas", texture : "/img/planets_small/mimas.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "enceladus", texture : "/img/planets_small/enceladus.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "tethys", texture : "/img/planets_small/tethys.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "rhea", texture : "/img/planets_small/rhea.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "hyperion", texture : "/img/planets_small/hyperion.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "iapetus", texture : "/img/planets_small/iapetus.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "phoebe", texture : "/img/planets_small/phoebe.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "janus", texture : "/img/planets_small/janus.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "epimetheus", texture : "/img/planets_small/epimetheus.jpg"}, tex));


KMG.textures.push(KMG.Util.extend({ name : "uranus", texture : "/img/planets_small/uranus.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "ariel", texture : "/img/planets_small/ariel.jpg"}, tex));

KMG.textures.push(KMG.Util.extend({ name : "neptune", texture : "/img/planets_small/neptune.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "triton", texture : "/img/planets_small/triton.jpg"}, tex));

KMG.textures.push(KMG.Util.extend({ name : "pluto", texture : "/img/planets_small/pluto.jpg"}, tex));
KMG.textures.push(KMG.Util.extend({ name : "charon", texture : "/img/planets_small/charon.jpg"}, tex));


KMG.DefaultSolarSystemPlanetConfig = {
	kmScalar : 0.000005,
	orbitColor : 0x304FFF
};



KMG.SolarSystemPlanet = function(context, config, def, tickController, parent, level) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSolarSystemPlanetConfig)
	
	
	// Make sure undefined or null become 0
	if (!level) {
		level = 0;
	}
	
	this.level = level;
	this.name = def.name;
	
	var displayLabels = (def.type == "planet");
	var isFocus = false;
	var orbitVisibility = KMG.OrbitDisplay.MajorPlanets | KMG.OrbitDisplay.Focus;

	var orbit;
	if (def.customOrbit) {
		// TODO: Safety check on the value of def.customOrbit
		orbit = new KMG[def.customOrbit]();
	} else if (def.elements) {
		orbit = new KMG.EllipticalOrbit(def.elements);
	}
	
	var rotation;
	if (def.customRotation) {
		rotation = new KMG[def.customRotation]();
	}
	this.rotational = rotation;
	
	
	
	var orbitPathLine;
	
	if (orbit && orbit.period > 0) {
		var scalar = KMG.AU_TO_KM * config.kmScalar;
		var pathConfig = {
			scale : scalar,
			segments : 365,
			subdivisions : 8,
			opacity : ((def.type == "planet") ? 0.6 : 0.3),
			color : config.orbitColor,
			lineThickness : 1.5
		};
		
		
		var orbitPathLine = new KMG.OrbitPathLine(context, pathConfig, orbit, parent);
		this.add(orbitPathLine);
	}
	
	// A pretty generic basis of dot luminosity based on the size of Ganymede, with a lower bound at 10%
	var dotOpacity = 1.0;
	if (def.type == "moon") {
		dotOpacity = def.radius / 2634;
		dotOpacity = (dotOpacity > 1) ? 1 : dotOpacity;
		dotOpacity = (dotOpacity < 0.15) ? 0.10 : dotOpacity;
	}
	var dotConfig = {
		opacity : dotOpacity,
		color : 0xFFFFFF,
		size : 2.0,
		texture : '/img/sprites/circle_50x50.png'
	};
	
	var planetDot = new KMG.DotPlotObject(context, dotConfig);
	this.add(planetDot);

	function findTexture(name) {
		var name = name.toLowerCase();
		for (var i = 0; i < KMG.textures.length; i++) {
			if (KMG.textures[i].name == name) {
				return name;
			}
		}
		return "asteroid";
	}
	
	
	
	
	var sphereConfig = {
						radius:def.radius * config.kmScalar,
						flattening : def.flattening,
						fog:false,
						scale:config.kmScalar,
						texture:findTexture(def.name),
						color:0xFFFFFF,
						specular : 0xAAAAAA,
						material : (def.name == "Earth" ? KMG.MaterialPhong : KMG.MaterialLambert),
						slices : (def.type == "planet" || def.name == "Moon"  ? 128 : 32),
						shadows : true
						};
						
	if (def.lightEmitting) {
		sphereConfig.ambient = 0xFFFFFF;
		sphereConfig.emissive = 0xFFFFFF;
		sphereConfig.shading = false;
	}
						
	var planet = new KMG.TexturedSphereObject(context, sphereConfig);
	this.add(planet);
	
	
	
	
	
	var text = new KMG.BillBoardTextObject(context, def.name, {}) 
	this.add(text);
	
	var orbitals = [planetDot, planet, text];
	
	var clouds;

	var ringTexture;
	switch (def.name) {
	case "Uranus":
		ringTexture = "Uranus";
		break;
	case "Neptune":
		ringTexture = "Neptune";
		break;
	case "Saturn":
	default:
		ringTexture = "Saturn";
		break;

	};
		
	var ring;
	if (def.ring && ringTexture) {
		ring = new KMG.RingObject(context, {
			ringInnerRadius : def.ring.innerRadius * config.kmScalar,
			ringOutterRadius : def.ring.outterRadius * config.kmScalar,
			targetObject : planetDot,
			displayRing : true,
			ringTexture : ringTexture
		});
		
		//if (def.ring.rotation) {
		//	ring.mesh.rotation.set(def.ring.rotation[0], def.ring.rotation[1], def.ring.rotation[2]);
		//}
		
		this.add(ring);
		orbitals.push(ring);
	}
	
	var orbiter;
	if (orbit) {
		orbiter = new KMG.EllipticalOrbiter(context, orbitals, scalar, 1, orbit, parent, tickController, false, true);
	}

	context.planets[def.name] = this;
	
	var moons = [];
	
	
	this.addChild = function(child) {
		this.add(child);
		orbitals.push(child);
		moons.push(child);
	};
	
	this.removeChild = function(child) {
		this.remove(child);
		
		/*
		var _orbitals = [];
		for (var i = 0; i < orbitals.length; i++) {
			if (orbitals[i] != child && _orbitals.push(orbitals[i]));
		}
		orbitals = _orbitals;
		
		var _moons = [];
		for (var i = 0; i < moons.length; i++) {
			if (moons[i] != child && _moons.push(moons[i]));
		}
		moons = _moons;
		*/
	};
	
	if (def.moons) {
		for (var i = 0; i < def.moons.length; i++) {
			var moon = def.moons[i];
			var p = new KMG.SolarSystemPlanet(context, config, moon, tickController, this, level+1);
			p.applyParentObliquity = true;
			this.addChild(p);
		}
	}
	
	this.getPlanetTopocentricVector = function(latitude, longitude, jd) {
		
		var ellipsoidRadius = KMG.Math.radiusAtGeocentricLatitude(def.radius * config.kmScalar, latitude * KMG.PI_BY_180, def.flattening);
		
		var position = KMG.Math.getPoint3D(longitude, // Longitude, in degrees
											latitude, // Latitude, in degrees
											ellipsoidRadius);

		if (rotation) {
			var rotationalQ = rotation.computeRotationalQuaternion(jd);
			
			//position.rotateY(rotationalQ.meridian * KMG.PI_BY_180 + KMG.RAD_90);
			
			//var e = new THREE.Euler(0, rotationalQ.meridian * KMG.PI_BY_180 - KMG.RAD_90, 0);
			//position.applyEuler(e);
			
			position.applyQuaternion(rotationalQ);
		}
		
		var vector = this.getPlanetVector();
		return vector.add(position);
	};
	
	this.getPlanetVector = function() {
		
		var pos = planetDot.position.clone();
		if (parent) {
			if (parent.rotational) {
				var rotationalQ = parent.rotational.computeRotationalQuaternion(context.tickController.tickJulian);
				pos.applyQuaternion(rotationalQ.noMeridian);
				
			}
			pos.add(parent.getPlanetVector());
		}
		
		return pos;
	};
	
	this.getRootPosition = function() {
		return  planetDot.position.clone();
	};
	
	this.setOrbitLinesVisibility = function(visible, traverse) {
		
		orbitVisibility = visible;

		if (traverse) {
			for (var i = 0; i < moons.length; i++) {
				moons[i].setOrbitLinesVisibility(visible, traverse);
			}
		}
		
	};
	
	this.setLabelVisibility = function(visible) {
		displayLabels = visible;
	};
	
	this.setIsFocus = function(focus) {
		isFocus = focus;
	};
	

	this.isAtScreenPosition = function(x, y, sceneOffset, radius, scale) {
		if (!radius) {
			radius = 0.033;
		}
		
		var projector = new THREE.Projector();
		var vector = new THREE.Vector3( x, y, 1 );
		
		var pos = this.getPlanetVector();
		pos.add(sceneOffset.clone().negate());
		pos.multiplyScalar(scale);
		projector.projectVector( pos, context.camera );
		
		pos.z = 0;
		vector.z = 0;
		
		return (vector.distanceTo(pos) <= radius);
	}
	
	this.onMousePosition = function(x, y, clientX, clientY, sceneOffset, scale) {
		

		var mouseOverRadius = 0.033;
		var projector = new THREE.Projector();
		var vector = new THREE.Vector3( x, y, 1 );
		
		var pos = this.getPlanetVector();
		if (sceneOffset) {
			pos.add(sceneOffset.clone().negate());
		}
		
		pos.multiplyScalar(scale);
		projector.projectVector( pos, context.camera );
		
		pos.z = 0;
		vector.z = 0;

		
		if (vector.distanceTo(pos) <= mouseOverRadius) {
			text.setVisibility(true);
		} else {
			text.setVisibility(false || displayLabels || isFocus);
			
			for (var i = 0; i < moons.length; i++) {
				moons[i].onMousePosition(x, y, clientX, clientY, sceneOffset.clone(), scale);
			}
		}
		
		
		
		
	};
	
	

	function isOrbitLineVisible() {
		
		var types = KMG.activeOrbitDisplays(orbitVisibility);
		 
		for (var i = 0; i < types.length; i++) {
			
			if (types[i] == KMG.OrbitDisplay.All)
				return true;
			if (types[i] == KMG.OrbitDisplay.MajorPlanets && def.type == "planet")
				return true;
			if (types[i] == KMG.OrbitDisplay.MinorPlanets && def.type == "minorplanet")
				return true;
			if (types[i] == KMG.OrbitDisplay.Moons && def.type == "moon") 
				return true;
			if (types[i] == KMG.OrbitDisplay.Focus && isFocus) 
				return true;
			
		}
		
		return false;
	}
	
	
	function applyRotation(object, rotationalQ) {
		if (!object) {
			return;
		}
		
		if (object.sphereMesh) {
			object.sphereMesh.rotation.y = rotationalQ.meridian * KMG.PI_BY_180 + KMG.RAD_90;
		}
		object.rotation.setFromQuaternion(rotationalQ.noMeridian);
		object.updateMatrix();
	}
	
	this.updatePosition = function() {
		if (orbiter) {
			orbiter.update();
			
			if (def.name == "Earth") {
				var p = planet.position.clone().normalize();
			//	console.info(context.tickController.tickJulian + " " + (p.angleTo(new THREE.Vector3(0, 0, 1)) * 180 / Math.PI) + " " + planet.position.length());
				
			}
			
		}
	};
	
	this.applyObliquityToObject = function(object, rotationalQ) {
		
		if (!rotationalQ && !rotation) {
			return;
		} else if (!rotationalQ && rotation) {
			rotationalQ = rotation.computeRotationalQuaternion(context.tickController.tickJulian);
		}
		
		applyRotation(object, rotationalQ);
		
	};
	
	this.update = function() {
		
		if (planet) {
			planet.update();
		}
		
		
		if (rotation) {

			var rotationalQ = rotation.computeRotationalQuaternion(context.tickController.tickJulian);
			applyRotation(planet, rotationalQ);
			applyRotation(ring, rotationalQ);
			applyRotation(clouds, rotationalQ);

			//orbitals
			for (var i = 0; i < orbitals.length; i++) {
				if (orbitals[i].applyParentObliquity) {
					applyRotation(orbitals[i], rotationalQ);
				}
			}
		}
		
		
		
		if (planetDot) {
			planetDot.update();
		}

		text.setVisibility(displayLabels || isFocus);
		
		if (orbitPathLine) {
			orbitPathLine.setVisibility(isOrbitLineVisible());
			if (isFocus) {
				orbitPathLine.lineMaterial.color = new THREE.Color(0xFF0000);
			} else {
				orbitPathLine.lineMaterial.color = new THREE.Color(config.orbitColor);
			}
		}

		
		for (var i = 0; i < moons.length; i++) {
			moons[i].update();
		}
		
		
	};
};
KMG.SolarSystemPlanet.prototype = Object.create( KMG.BaseObject.prototype );
