

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
	this.centerOnSun = false;
	var projector = new THREE.Projector();
	this.lookingTowards = (lookingTowards) ? lookingTowards : { position : new THREE.Vector3(0, 0, 0)};
	var orbitals = [];
	
	var scalar = KMG.AU_TO_KM * config.kmScalar;
	
	this.centerObjectVectors = centerObjectVectors;
	this.centerObjectElements = centerObjectElements;
	this.useVectorData = ephemeris.vectors.data.length > 0;
	
	this.applyParentObliquity = true;
	
	var orbit = new KMG.EllipticalOrbit(ephemeris.elements.data);
	
	function getFocusPoint() {
		return (config.focusPoint) ? config.focusPoint : objectDot.position.clone().negate();
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
		
		var pos = this.getPosition();
		pos.add(sceneOffset.clone().negate());
		pos.multiplyScalar(scale);
		projector.projectVector( pos, context.camera );
		
		pos.z = 0;
		vector.z = 0;
		
		return (vector.distanceTo(pos) <= radius);
	}
	
	
	this.onMousePosition = function(x, y, clientX, clientY) {
		
		if (config.suppressDatesOfInterest) {
			return null;
		}
		
		var eventObj = this.isMouseOverDateOfInterest(x, y);
		if (eventObj) {
			$("#event-container").html(
				"<span class='event-date'>" + KMG.Util.formatJulianDay(eventObj.date, true, "ll") + "</span><br/>"
				+ "<span class='event-title'>" + eventObj.title + "</span>"
			).css("top", ""+clientY+"px").css("left", ""+clientX+"px").css("display", "inline-block");
		} else {
			$("#event-container").css("display", "none");
		}
		
	};
	
	this.isMouseOverDateOfInterest = function(x, y)
	{
		if (config.suppressDatesOfInterest) {
			return null;
		}
		
		var vector = new THREE.Vector3( x, y, 1 );
		var focus = getFocusPoint();
		var mouseOverRadius = 0.033;
		
		for (var i = 0; i < ephemeris.datesOfInterest.length; i++) {
			var dateOfInterest = ephemeris.datesOfInterest[i];
			var dotPosition = dateOfInterest.position.clone().add(focus);
			projector.projectVector( dotPosition, context.camera );
			if (vector.distanceTo(dotPosition) <= mouseOverRadius) {
				return dateOfInterest; // Mouse is hovering over dot
			}
		}
		
		return null;
	};
	
	this.update = function() {
		
		if (model) {
			model.update();
		}
		
		if (vectorPathLine) {
			vectorPathLine.update();
			vectorPathLine.setVisibility(this.config.orbitsVisible);
		}

		if (orbitPathLine) {
			orbitPathLine.update();
			orbitPathLine.setVisibility(this.config.orbitsVisible);
		}
		
		/*
		if (!config.rideAlong) {
			var sceneTo = model.position.clone().negate();
			context.primaryScene.position = sceneTo;
			context.primaryScene.updateMatrix();
		} else {
			context.primaryScene.position = new THREE.Vector3(0, 0, 0);
			context.primaryScene.updateMatrix();
		}
		*/
		
		if (tickController.isActive() && config.leaveTrail) {
			 var dot = new KMG.DotPlotObject(context, {});
			 dot.position = model.position.clone();
			 this.add(dot);
		
		}
		
		/*
		var focus = getFocusPoint();
		var pos = objectDot.position.clone().add(focus);
		var labelPos = getLabelPosition(pos, label);

		label.css("top", labelPos.y + "px");
		label.css("left", labelPos.x + "px");
		
		if (labelPos.z > 1) {
			label.css("display", "none");
		} else {
			label.css("display", "inline-block");
		}
		*/
		
		var focus = getFocusPoint();
		for (var i = 0; i < ephemeris.datesOfInterest.length && !config.suppressDatesOfInterest; i++) {
			var dateOfInterest = ephemeris.datesOfInterest[i];
			dateOfInterest.numberLabel.css("display", this.config.dateMarkersVisible ? "inline-block" : "none");
			dateOfInterest.marker.setVisibility(this.config.dateMarkersVisible);
			
			if (this.config.dateMarkersVisible) {
				
				
				var dotPosition = dateOfInterest.position.clone().add(focus);

				var labelPos = getLabelPosition(dotPosition, dateOfInterest.numberLabel);
				
				dateOfInterest.numberLabel.css("top", labelPos.y + "px");
				dateOfInterest.numberLabel.css("left", labelPos.x + "px");
				
				if (labelPos.z > 1) {
					dateOfInterest.numberLabel.css("display", "none");
				} else {
					dateOfInterest.numberLabel.css("display", "inline-block");
				}
		
				
			}
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
	
	this.getPosition = function() {
		return model.position.clone();
	};
	
	this.setUsingFadingLine = function(useFading) {
		vectorPathLine.setUsingFadingLine(useFading);
	};
	
	this.setRideAlong = function(lookingAt) {
	
		if (!config.rideAlong) {
			return;
		}
		
		
		
				
		var modelView = new THREE.Matrix4();
		modelView.identity();

		var translateMatrix = new THREE.Matrix4();
		translateMatrix.makeTranslation(model.position.x, model.position.y, model.position.z);
		modelView.multiply(translateMatrix);
		modelView.lookAt(model.position, lookingAt, new THREE.Vector3( 0, 1, 0 ));
		
		
		//var m0 = new THREE.Matrix4();
		//m0.identity();
		//m0.lookAt(model.position, lookingAt, new THREE.Vector3( 0, 1, 0 ));
		translateMatrix.makeTranslation(0, 5000* config.kmScalar, 50000 * config.kmScalar);
		//translateMatrix.multiply(m0);
		//modelView.multiply(translateMatrix);
		
		context.camera.matrix.identity();
		context.camera.applyMatrix(modelView);
		context.camera.lookAt(lookingAt);
		context.camera.matrix.multiply(translateMatrix);
		
		var m1 = new THREE.Matrix4();
		m1.lookAt( model.position, lookingAt, new THREE.Vector3( 0, 1, 0 ));


		
		context.secondaryCamera.matrix.identity();
		var translateMatrix = new THREE.Matrix4();
		context.secondaryCamera.applyMatrix(m1);
		
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
		var vectorPathLineConfig = {
			scale : scalar
		};
		var fullLine = new KMG.VectorPathLine(context, vectorPathLineConfig, centerObjectVectors, ephemeris.vectors.data);
		var fadingLine = new KMG.FadingVectorPathLine(context, vectorPathLineConfig, centerObjectVectors, ephemeris.vectors.data);
		
		vectorPathLine = new THREE.Object3D();
		vectorPathLine.add(fullLine);
		vectorPathLine.add(fadingLine);
		
		vectorPathLine.update = function() {
			fullLine.update();
			fadingLine.update();
		};
		
		vectorPathLine.setVisibility = function(visible) {
			fullLine.setVisibility(visible);
			fadingLine.setVisibility(visible);
		};
		
		vectorPathLine.setUsingFadingLine = function(useFading) {
			
			if (useFading) {
				vectorPathLine.remove(fullLine);
				vectorPathLine.add(fadingLine);
			} else {
				vectorPathLine.add(fullLine);
				vectorPathLine.remove(fadingLine);
			}
		};
		vectorPathLine.setUsingFadingLine(config.useFadingVectorPath);

		this.add(vectorPathLine);
		//this.add(vectorPathLine);

	} else if (!this.useVectorData && !ephemeris.displayFuture) {
		var orbitConfig = {};//KMG.Util.clone(ephemeris.elements.data);
		orbitConfig.scale = scalar;
		orbitConfig.segments = 16000;
		orbitConfig.opacity = 0.8;
		orbitConfig.color = 0xFFFFFF;
		orbitConfig.closeOrbit = false;
		orbitConfig.lineThickness = 1.5;
		orbitConfig.orbit = orbit;
		vectorPathLine = new KMG.OrbitPathLine(context, orbitConfig, orbit, centerObjectElements, ephemeris.start, ephemeris.stop);
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
			opacity : 0.1,
			color : 0xFF0000,
			size : 15,
			texture : '/img/sprites/satellite_100x100.png'
		};
		model = new KMG.DotPlotObject(context, dotConfig);
		this.add(model);
		orbitals.push(model);
	} else if (ephemeris.type == "comet") {
		
		model = new KMG.CometObject(context, {lookingTowards : this.lookingTowards});
		this.add(model);
		orbitals.push(model);
		
	} else {
		var config = {radius:.0005, fog:false, scale:scalar, texture:"asteroid", color:0xFFFFFF};
		model = new KMG.TexturedSphereObject(context, config);
		this.add(model);
		orbitals.push(model);
	}
	
	
	var dotConfig = {
		opacity : 0.1,
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
	if (ephemeris.displayFuture && !config.suppressFuture) {
		var orbitConfig = {};//KMG.Util.clone(ephemeris.elements.data);
		orbitConfig.scale = scalar;
		orbitConfig.segments = 8192;
		orbitConfig.opacity = 0.8;
		orbitConfig.color = config.elementsOrbitColor;
		orbitConfig.lineThickness = 1.5;
		orbitPathLine = new KMG.OrbitPathLine(context, orbitConfig, orbit, centerObjectElements, ephemeris.start, ephemeris.stop);
		this.add(orbitPathLine);
		
		//if (centerObjectElements && centerObjectElements.orbiter) {
		//	centerObjectElements.orbiter.object.push(orbitPathLine);
		//}
	}

	/*
	var label = $("<div/>").attr("id", "name-label-" + ephemeris.name)
								.addClass("scene-object-label")
								.text(ephemeris.name)
								.appendTo('body');
	*/
	var label = new KMG.BillBoardTextObject(context,ephemeris.name, {});
			//numberLabel.position = posOnDate;
	this.add(label);
	orbitals.push(label);
	
	
	
	
	var orbiter = new KMG.EllipticalOrbiter(context, orbitals, scalar, 0, orbit, centerObjectElements, tickController);
	if (this.useVectorData) {
		orbiter = new KMG.EphemerisOrbiter(context, orbitals, scalar, 0, orbiter, ephemeris.vectors, ephemeris.displayFuture, centerObjectVectors, centerObjectElements, tickController);
	} 
	
	//var ellipticalOrbit = new KMG.EllipticalOrbit(ephemeris.elements.data);

	var vectorsStartDate, vectorsEndDate;
	if (this.useVectorData) {
		vectorsStartDate = ephemeris.vectors.data[0].epoch;
		vectorsEndDate = ephemeris.vectors.data[ephemeris.vectors.data.length - 1].epoch;
	}
	
	if (!config.suppressDatesOfInterest) {
		for (var i = 0; i < ephemeris.datesOfInterest.length; i++) {
			var dateDotObj = new KMG.DotPlotObject(context, {opacity:1.0, size: 32, texture : '/img/sprites/bullet_red.png'});
			//var posOnDate = ellipticalOrbit.positionAtTime(ephemeris.datesOfInterest[i].date);
			var posOnDate = getPositionVectorForDate(ephemeris.datesOfInterest[i].date);
			posOnDate.multiplyScalar(scalar);
			dateDotObj.position = posOnDate;
			this.add(dateDotObj);
			ephemeris.datesOfInterest[i].marker = dateDotObj;
			ephemeris.datesOfInterest[i].position = posOnDate;
			
			console.info("Creating date of interest for " + (i + 1));
			
			//var numberLabel = new KMG.BillBoardTextObject(context, ""+(i+1), {});
			//numberLabel.position = posOnDate;
			//this.add(numberLabel);
			
			var numberLabel = $("<div/>").attr("id", "number-label-" + i)
									.addClass("scene-object-label")
									.text(""+(i+1))
									.appendTo('body');
			ephemeris.datesOfInterest[i].numberLabel = numberLabel;
			
		}
	}
	

	
};
KMG.OrbitingObject.prototype = Object.create( KMG.BaseObject.prototype );
	
	
