


KMG.EphemerisOrbiter = function(context, object, scale, orbitSpeed, orbit, vectors, displayFuture, centerObjectVectors, centerObjectElements, tickController, skipIfInvisible, dontAddToScene) {

	KMG.BaseObject.call( this );
	var scope = this;
	this.scale = (scale) ? scale : 5.0;
	this.orbitSpeed = (orbitSpeed) ? orbitSpeed : 1.0;
	this.centerObjectVectors = centerObjectVectors;
	this.centerObjectElements = centerObjectElements;
	this.displayFuture = displayFuture;
	this.period = orbit.period;
	var epoch = orbit.epoch;
	
	this.ownTickController = (tickController) ? false : true;
	this.tickController = (tickController) ? tickController : new KMG.TimeBasedTickController(orbitSpeed);
	if (this.ownTickController) {
		this.tickController.start();
	}
	
	var vectorsStartDate = vectors.data[0].epoch;
	var vectorsEndDate = vectors.data[vectors.data.length - 1].epoch;
	
	
	var ellipticalOrbiter = orbit;
	
	if (!dontAddToScene) {
		context.objects.push(this);
	}
	
	function getTickTime() {
		if (scope.ownTickController) {
			scope.tickController.update();
		}

		var t;
		if (!scope.ownTickController && scope.tickController.tickJulian) {
			t = scope.tickController.tickJulian;
		} else {
			var tickPeriod = (360 / scope.orbitSpeed);
			t = epoch + (scope.tickController.ticks * tickPeriod);
		}
		
		return t;
	}
	
	
	function isDateInVectorRange(t) {
		return (t <= vectorsEndDate || (!scope.displayFuture && t >= vectorsEndDate));
	}
	
	function getDateFraction(t) {
		if (!isDateInVectorRange(t)) {
			return -1;
		}
		
		var f = (t - vectorsStartDate) / (vectorsEndDate - vectorsStartDate);
		return f;
	}
	
	function getVectorIndexForDateFraction(f) {
		var i = f * vectors.data.length;
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
				lower : vectors.data[0],
				upper : vectors.data[0]
			};
		} else if (!scope.displayFuture && t >= vectorsEndDate) {
			return {
				f : 0,
				lower : vectors.data[vectors.data.length - 1],
				upper : vectors.data[vectors.data.length - 1]
			};
		} else {
		
			var f = getDateFraction(t);
			var i = getVectorIndexForDateFraction(f);
			
			var lower = parseInt(i);
			var upper = parseInt(Math.round(i+0.5));
			
			if (upper >= vectors.data.length) {
				upper = lower;
			}

			return {
				f : i - Math.floor(i),
				lower : vectors.data[lower],
				upper : vectors.data[upper]
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
	
	
	function advanceOrbit(object) {
		
		var t = getTickTime();
		
		if (scope.skipIfInvisible && !object.visible) {
			return;
		}

		if (isDateInVectorRange(t)) {
			
			var vector = getInterpolatedVectorForDate(t);
			
			object.position = vector;
			object.position.multiplyScalar(scope.scale);
			
			if (scope.centerObjectVectors) {
				var centerPosition = scope.centerObjectVectors.position.clone();
				var centerOnEcliptic = new THREE.Vector3(centerPosition.x, 0, centerPosition.z);
				var centerObjectOrbitAngle = Math.abs(centerOnEcliptic.normalize().angleTo(new THREE.Vector3(0.0, 0.0, 1)));

				if (centerPosition.x < 0) {
					centerObjectOrbitAngle = KMG.RAD_180 + (KMG.RAD_180 - centerObjectOrbitAngle);
				}
				object.position.add(centerPosition);
			
			}
			
			object.updateMatrix();
			
		} else {
			ellipticalOrbiter.update();
		}
		
	}
	

	this.update = function()
	{
		if (object instanceof Array) {
			for (var i = 0; i < object.length; i++) {
				advanceOrbit(object[i]);
			}
		} else {
			advanceOrbit(object);
		}
	};


};
KMG.EphemerisOrbiter.prototype = Object.create( KMG.BaseObject.prototype );
