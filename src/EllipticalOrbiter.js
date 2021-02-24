
KMG.BasicOrbiter = function(context, object, distance, rotationSpeed) {
	KMG.BaseObject.call( this );
	var scope = this;
	this.distance = distance;
	this.rotationSpeed = rotationSpeed;
	this.object = object;
	
	context.objects.push(this);

	function advanceOrbit(obj) {
		if (!obj.lastYRotation) {
			obj.lastYRotation = 0;
		}
		
		obj.lastYRotation += rotationSpeed;
		
		obj.position = new THREE.Vector3( 0, 0, -1000 );
		obj.position.multiplyScalar(distance);
		obj.position.rotateY(obj.lastYRotation*(Math.PI/180.0));
		
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
KMG.BasicOrbiter.prototype = Object.create( KMG.BaseObject.prototype );



KMG.EllipticalOrbiter = function(context, object, scale, orbitSpeed, orbit, centerObject, tickController, skipIfInvisible, dontAddToScene) {

	KMG.BaseObject.call( this );
	var scope = this;
	this.scale = (scale) ? scale : 5.0;
	this.orbitSpeed = (orbitSpeed) ? orbitSpeed : 1.0;
	//this.orbitConfig = orbitConfig;
	this.object = object;
	var epoch = 2451545;
	this.centerObject = centerObject;
	this.skipIfInvisible = skipIfInvisible;
	this.period = orbit.period;
	
	this.ownTickController = (tickController) ? false : true;
	this.tickController = (tickController) ? tickController : new KMG.TimeBasedTickController(orbitSpeed);
	if (this.ownTickController) {
		this.tickController.start();
	}
	
	if (!dontAddToScene) {
		context.objects.push(this);
	}
	

	function advanceOrbit(obj) {
		if (scope.ownTickController) {
			scope.tickController.update();
		}
		
		if (scope.skipIfInvisible && !obj.visible) {
			return;
		}
		
		
		var t;
		if (!scope.ownTickController && scope.tickController.tickJulian) {
			t = scope.tickController.tickJulian;
		} else {
			var tickPeriod = (360 / scope.orbitSpeed);
			t = epoch + (scope.tickController.ticks * tickPeriod);
		}

		var p = orbit.positionAtTime(t);
		
		obj.position = p;
		obj.position.multiplyScalar(scope.scale);
		
		if (scope.centerObject) {
			var centerPosition = scope.centerObject.position.clone();
			var centerOnEcliptic = new THREE.Vector3(centerPosition.x, 0, centerPosition.z);
			var centerObjectOrbitAngle = Math.abs(centerOnEcliptic.normalize().angleTo(new THREE.Vector3(0.0, 0.0, 1)));

			if (centerPosition.x < 0) {
				centerObjectOrbitAngle = KMG.RAD_180 + (KMG.RAD_180 - centerObjectOrbitAngle);
			}
			obj.position.add(centerPosition);
		
		}
		
		obj.updateMatrix();
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
KMG.EllipticalOrbiter.prototype = Object.create( KMG.BaseObject.prototype );
