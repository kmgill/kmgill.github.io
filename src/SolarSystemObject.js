


KMG.VectorLinesObject = function ( context, config, data, centerObjectVectors) {
	
	KMG.BaseObject.call( this );
	var scalar = KMG.AU_TO_KM * config.kmScalar;
	var vectorPathLineConfig = {
		scale : scalar
	};
	var fullLine = new KMG.VectorPathLine(context, vectorPathLineConfig, centerObjectVectors, data);
	var fadingLine = new KMG.FadingVectorPathLine(context, vectorPathLineConfig, centerObjectVectors, data);
	

	this.add(fullLine);
	this.add(fadingLine);
	

	this.setVisibility = function(visible) {
		fullLine.setVisibility(visible);
		fadingLine.setVisibility(visible);
	};
	
	this.setUsingFadingLine = function(useFading) {
		
		if (useFading) {
			this.remove(fullLine);
			this.add(fadingLine);
		} else {
			this.add(fullLine);
			this.remove(fadingLine);
		}
	};
	this.setUsingFadingLine(config.useFadingVectorPath);

	this.setLineColor = function(color) {
		fullLine.setLineColor(color);
		fadingLine.setLineColor(color);
	};

		
	this.update = function() {
		fullLine.update();
		fadingLine.update();
	};

};
KMG.VectorLinesObject.prototype = Object.create( KMG.BaseObject.prototype );
	



KMG.DefaultOrbitingObjectConfig = {
	kmScalar : 0.000005,
	rideAlong : false,
	leaveTrail : false,
	orbitsVisible : true,
	dateMarkersVisible : true,
	focusPoint : new THREE.Vector3(0, 0, 0),
	suppressFuture : false,
	suppressDatesOfInterest : false,
	useFadingVectorPath : false,
	suppressSpacecraftModels : false,
	elementsOrbitColor : 0xFF0000
};

KMG.OrbitingObject = function ( context, config, ephemeris, tickController, centerObjectVectors, centerObjectElements, lookingTowards ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultOrbitingObjectConfig);
	var scope = this;

	var projector = new THREE.Projector();

	var orbitals = [];
	
	var scalar = KMG.AU_TO_KM * config.kmScalar;
	
	this.centerObjectVectors = centerObjectVectors;
	this.centerObjectElements = centerObjectElements;
	
	
	this.useVectorData = ephemeris.vectors.data.length > 0;
	
	this.applyParentObliquity = (ephemeris["applyParentObliquity"] === true);
	
	var orbit = new KMG.EllipticalOrbit(ephemeris.elements.data);
	
	var isFocus = false;
	var orbitVisibility = KMG.OrbitDisplay.MajorPlanets | KMG.OrbitDisplay.Focus;
	
	this.setIsFocus = function(focus) {
		isFocus = focus;
	};
	
	
	this.getPosition = function() {
		return objectDot.position.clone();
	};
	
	this.getPlanetVector = function() {
		var pos = this.getPosition();
		pos.applyEuler(this.rotation);
		
		if (centerObjectElements) {
			pos.add(centerObjectElements.getPlanetVector());
		}
		
		return pos;
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
	
	
	this.onMousePosition = function(x, y, clientX, clientY) {
		

	};
	
	this.setFutureOrbitVisibility = function(visible) {
		orbiter.displayFuture = visible;
		if (orbitPathLine && visible) {
			this.add(orbitPathLine);
		} else if (orbitPathLine && !visible) {
			this.remove(orbitPathLine);
		}
	};
	
	this.updatePosition = function() {
		orbiter.update();
	};
	
	this.update = function() {
		
		if (model) {
			model.update();
		}
		
		if (vectorPathLine) {
			vectorPathLine.update();
			vectorPathLine.setVisibility(this.config.orbitsVisible);
			vectorPathLine.setLineColor(isFocus ? 0xFF0000 : 0x999999);
		}

		if (orbitPathLine) {
			orbitPathLine.update();
			orbitPathLine.setVisibility(this.config.orbitsVisible);
			if (isFocus) {
				orbitPathLine.lineMaterial.color = new THREE.Color(0xFF0000);
			} else {
				orbitPathLine.lineMaterial.color = new THREE.Color(0x999999);
			}
		}
		
	
		
		if (tickController.isActive() && config.leaveTrail) {
			 var dot = new KMG.DotPlotObject(context, {});
			 dot.position = model.position.clone();
			 this.add(dot);
		
		}
		
		

	};
	
	
	function getLabelPosition(vec, lbl)
	{
		projector.projectVector( vec, context.camera );

		var x =  (vec.x + 1) / 2 * window.innerWidth - (lbl.width() / 2);
		var y = (-vec.y + 1) / 2 * window.innerHeight;
		
		return {
			x : parseInt(Math.round(x)),
			y : parseInt(Math.round(y)),
			z : vec.z
		};
	}
	

	
	this.setUsingFadingLine = function(useFading) {
		if (vectorPathLine) {
			vectorPathLine.setUsingFadingLine(useFading);
		}
	};
	
	
	// In AU
	this.getDistanceTo = function(other) {
		return model.position.distanceTo(other) / scalar;
	};
	
	this.getVelocityOnTick = function() {
		var t = tickController.tickJulian;
		var velocity = 0;
		
		if (isDateInVectorRange(t)) {
			var v = getInterpolatedVelocityVectorForDate(t);
			v.multiplyScalar(KMG.AU_TO_KM * 1000);
			v.multiplyScalar(1.0 / 86400.0);
			velocity = Math.sqrt(KMG.Math.sqr(v.x) + KMG.Math.sqr(v.y) + KMG.Math.sqr(v.z));
		} else {
			var v = orbit.velocityAtTime(t);
			v.multiplyScalar(KMG.AU_TO_KM * 1000);
			velocity = Math.sqrt(KMG.Math.sqr(v.x) + KMG.Math.sqr(v.y) + KMG.Math.sqr(v.z));
		}
		
		
		return velocity;
	};
	
	
	
	function isDateInVectorRange(t) {
		return (scope.useVectorData && (t <= vectorsEndDate || (!ephemeris.displayFuture && t >= vectorsEndDate)));
	}
	
	function getDateFraction(t) {
		if (!isDateInVectorRange(t)) {
			return -1;
		}
		
		var f = (t - vectorsStartDate) / (vectorsEndDate - vectorsStartDate);
		return f;
	}
	
	function getVectorIndexForDateFraction(f) {
		var i = f * ephemeris.vectors.data.length;
		return i;
	}
	
	
	function getVectorsForDate(t) {

		if (!isDateInVectorRange(t)) {
			return -1;
		}

		// if the request date is before the vectors, then we assume it to be before the launch.
		// This should only apply to artificial spacecraft
		if (t < vectorsStartDate) {
			return {
				f : 0,
				lower : ephemeris.vectors.data[0],
				upper : ephemeris.vectors.data[0]
			};
		} else if (!ephemeris.displayFuture && t >= vectorsEndDate) {
			return {
				f : 0,
				lower : ephemeris.vectors.data[ephemeris.vectors.data.length - 1],
				upper : ephemeris.vectors.data[ephemeris.vectors.data.length - 1]
			};
		} else {
		
			var f = getDateFraction(t);
			var i = getVectorIndexForDateFraction(f);
			
			var lower = parseInt(i);
			var upper = parseInt(Math.round(i+0.5));
			
			if (upper >= ephemeris.vectors.data.length) {
				upper = lower;
			}

			return {
				f : i - Math.floor(i),
				lower : ephemeris.vectors.data[lower],
				upper : ephemeris.vectors.data[upper]
			};
		}
		
	}
	
	function getInterpolatedVectorForDate(t) {
		if (!isDateInVectorRange(t)) {
			return -1;
		}
		
		var vectors = getVectorsForDate(t);
		if (vectors == -1) {
			return -1;
		}
		

		var x = (vectors.upper.x * vectors.f) + (vectors.lower.x * (1-vectors.f));
		var y = (vectors.upper.y * vectors.f) + (vectors.lower.y * (1-vectors.f));
		var z = (vectors.upper.z * vectors.f) + (vectors.lower.z * (1-vectors.f));

		return new THREE.Vector3(x, z, -y);
	}
	
	function getPositionVectorForDate(t) {
		var vector;
		
		
		if (isDateInVectorRange(t)) {
			vector = getInterpolatedVectorForDate(t);
		} else {
			vector = orbit.positionAtTime(t);
		}
		return vector;
	}
	
	function getInterpolatedVelocityVectorForDate(t) {
		if (!isDateInVectorRange(t)) {
			return -1;
		}
		
		var vectors = getVectorsForDate(t);
		if (vectors == -1) {
			return -1;
		}
		
		var x = (vectors.upper.vx * vectors.f) + (vectors.lower.vx * (1-vectors.f));
		var y = (vectors.upper.vy * vectors.f) + (vectors.lower.vy * (1-vectors.f));
		var z = (vectors.upper.vz * vectors.f) + (vectors.lower.vz * (1-vectors.f));
		
		return new THREE.Vector3(x, y, x);
	}
	

	var vectorPathLine;
	if (this.useVectorData) {
		// Vector data exists, create a line for it
		vectorPathLine = new KMG.VectorLinesObject( context, config, ephemeris.vectors.data, centerObjectVectors);
		this.add(vectorPathLine);		
	} else {
		var orbitConfig = {};//KMG.Util.clone(ephemeris.elements.data);
		orbitConfig.scale = scalar;
		orbitConfig.segments = 16000;
		orbitConfig.opacity = 0.8;
		orbitConfig.color = 0xFFFFFF;
		orbitConfig.closeOrbit = false;
		orbitConfig.lineThickness = 1.5;
		orbitConfig.orbit = orbit;
		vectorPathLine = new KMG.OrbitPathLine(context, orbitConfig, orbit, centerObjectElements, ephemeris.start, ephemeris.stop);
		vectorPathLine.setUsingFadingLine = function() { };
		vectorPathLine.setLineColor = function(color) {
			vectorPathLine.lineMaterial.color = new THREE.Color(color);
		};
		this.add(vectorPathLine);
		
	}
	
	
	

	var model;
	if (ephemeris.type == "spacecraft") {
		
		if (!config.suppressSpacecraftModels) {
			var modelName = (ephemeris.model) ? ephemeris.model.file : "generic";
			var modelScale = (ephemeris.model) ? ephemeris.model.scale : 1.0;
			
			var onLoad = function ( object ) {
				object.scale.set(40, 40, 40);

				object.traverse(function(obj) {
					obj.scale.set(modelScale, modelScale, modelScale);
					if (obj.material) {
						obj.material.fog = false;
						obj.material.shading = THREE.SmoothShading;
					}
				});
				scope.add(object);
				orbitals.push(object);
				object.update = function() { };
				model = object;
			};
			
			
			if (KMG.Util.isUserMobile()) {
				var loader = new THREE.OBJLoader();
				loader.load( 'obj/' + modelName + '/' + modelName + '.obj',  onLoad);
			} else {
				var loader = new THREE.OBJMTLLoader();
				loader.load( 'obj/' + modelName + '/' + modelName + '.obj', 'obj/' + modelName + '/' + modelName + '.mtl', onLoad);
			}
		}
	} else if (ephemeris.type == "satellite") {
		var dotConfig = {
			opacity : 1.0,
			color : 0xFF0000,
			size : 15,
			texture : '/img/sprites/satellite_100x100.png'
		};
		model = new KMG.DotPlotObject(context, dotConfig);
		this.add(model);
		orbitals.push(model);
	} else if (ephemeris.type == "comet") {
		
		model = new KMG.CometObject(context, {lookingTowards : centerObjectElements});
		this.add(model);
		orbitals.push(model);
		
	} else {
		var config = {radius:.0005, fog:false, scale:scalar, texture:"asteroid", color:0xFFFFFF};
		model = new KMG.TexturedSphereObject(context, config);
		this.add(model);
		orbitals.push(model);
	}
	
	
	var dotConfig = {
		opacity : 1.0,
		color : 0xFFFFFF,
		texture : '/img/sprites/circle_50x50.png'
	};
	var objectDot = new KMG.DotPlotObject(context, dotConfig);
	
	if (!model) {
		model = objectDot;
	}
	this.add(objectDot);
	orbitals.push(objectDot);

	var orbitPathLine;
	if (ephemeris.displayFuture) {
		var orbitConfig = {};
		orbitConfig.scale = scalar;
		orbitConfig.segments = 8192;
		orbitConfig.opacity = 0.8;
		orbitConfig.color = config.elementsOrbitColor;
		orbitConfig.lineThickness = 1.5;
		orbitConfig.closeOrbit = false;
		orbitPathLine = new KMG.OrbitPathLine(context, orbitConfig, orbit, centerObjectElements, ephemeris.start, ephemeris.stop);
		this.add(orbitPathLine);

	}

	var label = new KMG.BillBoardTextObject(context,ephemeris.name, {});
	this.add(label);
	orbitals.push(label);
	
	
	
	
	var orbiter = new KMG.EllipticalOrbiter(context, orbitals, scalar, 0, orbit, centerObjectElements, tickController, false, true);
	if (this.useVectorData) {
		orbiter = new KMG.EphemerisOrbiter(context, orbitals, scalar, 0, orbiter, ephemeris.vectors, ephemeris.displayFuture, centerObjectVectors, centerObjectElements, tickController, false, true);
	}
	
	var vectorsStartDate, vectorsEndDate;
	if (this.useVectorData) {
		vectorsStartDate = ephemeris.vectors.data[0].epoch;
		vectorsEndDate = ephemeris.vectors.data[ephemeris.vectors.data.length - 1].epoch;
	}
	

	
};
KMG.OrbitingObject.prototype = Object.create( KMG.BaseObject.prototype );
	
	
