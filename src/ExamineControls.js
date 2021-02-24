
KMG.CenterPivot = 1;
KMG.SurfacePivot = 2;

KMG.Distance = 1;
KMG.Scale = 2;
KMG.FoV = 3;

KMG.ExamineControls = function ( gl, object, domElement, onChange ) {

	this.gl = gl;
	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	this.orientation = new THREE.Quaternion();
	
	console.info("Initializing examine controls");
	
	// API
	this.enabled = true;
	
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
	
	this.center = new THREE.Vector3(0, 0, 0);
	this.lastPosition = new THREE.Vector3(0, 0, 0);
	
	this.translate = new THREE.Vector3(0, 0, 0);
	
	this.pitchType = KMG.SurfacePivot;
	
	this.zoomType = KMG.Distance;
	
	this.maxDistance = 10000;
	this.minDistance = 210;
	this.distance = 700;
	this.defaultDistance = 700;
		
	this.maxScale = 10000.0;
	this.minScale = 0.0001;
	this.scale = 1.0;
	this.defaultScale = 1.0;
	
	this.maxFov = 90;
	this.minFov = 0.0001;
	this.fov = 45;
	this.defaultFov = 45;
	
	
	this.maxPitch = 90.0 * (Math.PI / 180.0);
	this.minPitch = 0.0;
	this._pitch = 0.0;
	this._yaw = 0.0;
	this._roll = 0.0;
	
	this.panVertical = 0;
	this.panHorizontal = 0;
	
	this.radius = 200;
	
	this.distanceMoveSpeed = 0.2;
	this.zoomSpeed = 0.001;
	this.rotateSpeed = 0.5;
	
	this.modelView = new THREE.Matrix4();
	
	var matrixRoll = new THREE.Matrix4();
	var matrixPitch = new THREE.Matrix4();
	var matrixYaw = new THREE.Matrix4();
	

	var lastX = -1;
	var lastY = -1;
	var mouseDownX = -1;
	var mouseDownY = -1;
	
	var scope = this;
	var changeEvent = { type: 'change' };
	
	var lastRotateX = 0;
	var lastRotateY = 0;
	
	var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE : 3, TOUCH_ZOOM : 4, TOUCH_PAN : 5, PITCH_ROLL_YAW : 6, ZOOM_SMOOTH : 7 };
	var state = STATE.NONE;
	
	var DIRECTION = { VERTICAL : 0, HORIZONTAL : 1 };
	
	this.toConfig = function() {
		var config = {
			type : "ExamineControls",
			pitch : this._pitch,
			roll : this._roll,
			yaw : this._yaw,
			orientation : this.orientation.toArray(),
			distance : this.distance,
			scale : this.scale
		};
		
		return config;
	};
	
	function isValidConfigNumber(v) {
		return v !== undefined && v !== null && v !== NaN;	
	}
	
	this.fromConfig = function(view) {
		if (!view) {
			return;
		}
		
		this._pitch = (isValidConfigNumber(view.pitch)) ? view.pitch : this._pitch;
		this._roll = (isValidConfigNumber(view.roll)) ? view.roll : this._roll;
		this._yaw = (isValidConfigNumber(view.yaw)) ? view.yaw : this._yaw;
		this.distance = (isValidConfigNumber(view.distance)) ? view.distance : this.distance;
		this.scale = (isValidConfigNumber(view.scale)) ? view.scale : this.scale;
		if (view.orientation) {
			this.orientation.fromArray(view.orientation);
		}
		this._update();
	};
	
	this.reset = function()
	{
		this._pitch = 0;
		this._roll = 0;
		this._yaw = 0;
		this.orientation = new THREE.Quaternion();
		
		this._update();
	};
	
	
	this.rotate = function( rotateX, rotateY ) {
		lastRotateX = rotateX;
		lastRotateY = rotateY;
		
		rotateX *= this.rotateSpeed;
		rotateY *= this.rotateSpeed;
	
		var xAxis = new THREE.Vector3(1, 0, 0);
		var yAxis = new THREE.Vector3(0, 1, 0);
		
		xAxis.rotateX(this._pitch);
		xAxis.rotateZ(this._roll);
		yAxis.rotateX(this._pitch);
		yAxis.rotateZ(this._roll);
	
		var xRot = new THREE.Quaternion();
		xRot.setFromAxisAngle(xAxis, -rotateX);
		
		var yRot = new THREE.Quaternion();
		yRot.setFromAxisAngle(yAxis, -rotateY);
		
		var newRot = yRot.multiply(xRot);
		this.orientation = this.orientation.multiply(newRot);
		
		this._update();
	};
	
	this.update = function(force) {
		if (force) {
			this._update();
		} else {
			if (state == STATE.NONE && (lastRotateX || lastRotateY) ) {
			//	this.rotate(lastRotateX, lastRotateY);
			}
		}
	};
	
	
	this._update = function(skipEventDispatch) {
		
		if (this.object instanceof Array) {
			for (var i = 0; i < this.object.length; i++) {
				this._updateObject(this.object[i]);
			}
		} else {
			this._updateObject(this.object);
		}
		
		if (!skipEventDispatch) {
			this.dispatchEvent( changeEvent );
		}
	}
	
	this._updateObject = function(object) {
	
		var translateMatrix = new THREE.Matrix4();

		matrixPitch.identity().makeRotationX(this._pitch);
		matrixYaw.identity().makeRotationY(this._yaw);
		matrixRoll.identity().makeRotationZ(this._roll);
		matrixRoll.multiply(matrixPitch);
		this.modelView.identity();
		
		
		var m = new THREE.Matrix4();
		m.identity();
		m.makeRotationFromQuaternion(this.orientation);
		this.modelView.multiply(m);
		
		if (this.pitchType == KMG.SurfacePivot) {
			translateMatrix.makeTranslation(0, 0, this.radius);
			this.modelView.multiply( translateMatrix );
		}
		
		this.modelView.multiply( matrixYaw );
		this.modelView.multiply( matrixRoll );
		
		if (this.pitchType == KMG.SurfacePivot) {
			translateMatrix.makeTranslation(0, 0, -this.radius);
			this.modelView.multiply( translateMatrix );
		}
		
		if (!object.forceDefaultDistance) {
			translateMatrix.makeTranslation(0, 0, this.distance);
			this.modelView.multiply( translateMatrix );
		} else {
			translateMatrix.makeTranslation(0, 0, this.defaultDistance);
			this.modelView.multiply( translateMatrix );
		}

		translateMatrix.makeTranslation(0, this.panVertical, 0);
		this.modelView.multiply( translateMatrix );
		
		translateMatrix.makeTranslation(this.panHorizontal, 0, 0);
		this.modelView.multiply( translateMatrix );
		
		//
		if (this.translate) {
			translateMatrix.makeTranslation(this.translate.x, this.translate.y, this.translate.z);
			this.modelView.multiply( translateMatrix );
		}
		
		object.matrix.identity();
		object.applyMatrix(this.modelView);

		
	};
	
	this.eyeDistanceToCenter = function() {
		var position = new THREE.Vector3(0.0, 0.0, this.radius);
		position.rotate(this.pitch, "X");
		position.negate();
		
		var a = this.distance + position.z;
		
		var distanceToCenter = Math.sqrt((position.y * position.y) + (a * a));
		return distanceToCenter;
	};
	
	this.eyeDistanceToSurface = function() {
		var distanceToSurface = this.eyeDistanceToCenter();// - (this.radius * this.scale);
		return distanceToSurface;
	};
	
	this.setScale = function( scale ) {
		if (scale > this.maxScale)
			scale = this.maxScale;
		if (scale < this.minScale)
			scale = this.minScale;
		this.scale = scale;
	};
	
	this.setMinScale = function( minScale ) {
		this.minScale = minScale;
		if (this.scale < minScale)
			this.scale = minScale;
	};
	
	this.setMaxScale = function( maxScale ) {
		this.maxScale = maxScale;
		if (this.scale > maxScale)
			this.scale = maxScale;
	};
	
	this.setFov = function( fov ) {
		if (this.maxFov > fov)
			fov = this.maxFov;
		if (this.minFov < fov)
			fov = this.minFov;
		this.fov = fov;
	};
	
	this.pitch = function ( pitch ) {
		this.setPitch(this._pitch + (pitch * this.rotateSpeed));
	};
	
	this.setPitch = function( pitch ) {
		if (pitch > this.maxPitch) 
			pitch = this.maxPitch;
		if (pitch < this.minPitch)
			pitch = this.minPitch;
		this._pitch = pitch;
		this._update();
	};
	
	this.setMinPitch = function( minPitch ) {
		this.minPitch = minPitch;
		if (this._pitch < minPitch)
			this._pitch = minPitch;
	};
	
	this.setMaxPitch = function( maxPitch ) {
		this.maxPitch = maxPitch;
		if (this._pitch > maxPitch)
			this._pitch = maxPitch;
	};
	
	this.roll = function ( roll ) {
		this.setRoll(this._roll + (roll * this.rotateSpeed));
	};
	
	this.setRoll = function( roll ) {
		this._roll = roll;
		this._update();
	};
	
	
	this.setDistance = function( distance ) {
		if (distance > this.maxDistance)
			distance = this.maxDistance;
		if (distance < this.minDistance)
			distance = this.minDistance;
		this.distance = distance;
		this._update();
	};
	
	this.setMinDistance = function( minDistance ) {
		this.minDistance = minDistance;
		if (this.distance < minDistance)
			this.distance = minDistance;
	};
	
	this.setMaxDistance = function( maxDistance ) {
		this.maxDistance = maxDistance;
		if (this.distance > maxDistance)
			this.distance = maxDistance;
	};
	
	
	this.pan = function(amount, direction) {
		if (!direction || direction === DIRECTION.VERTICAL) {
			this.panVertical = this.panVertical + amount;
		} else if (direction === DIRECTION.HORIZONTAL) {
			this.panHorizontal = this.panHorizontal + amount;
		}
		this._update();
	};
	
	
	function _adjustDistanceByDelta(delta) {
		
		if (scope.zoomType == KMG.Distance) {
		
			// Adjust the distance by a proportional amount every time
			var ratio = scope.distanceMoveSpeed / scope.defaultDistance;
			var distanceMove = ratio * scope.distance;
			
			scope.setDistance(scope.distance + (-delta * distanceMove));
			
		} else if (scope.zoomType == KMG.Scale) {
			
			// Adjust the distance by a proportional amount every time
			var ratio = scope.zoomSpeed / scope.defaultScale;
			var scaleMove = ratio * scope.scale;
			
			scope.setScale(scope.scale + (delta * scaleMove));
		} else if (scope.zoomType == KMG.FoV) {
			
		}
	}
	
	// Events
	function onMouseDown( event ) {
		if (!scope.enabled) return;
		
		lastX = event.clientX;
		lastY = event.clientY;
		
		mouseDownX = event.clientX;
		mouseDownY = event.clientY;
		
		lastRotateX = 0;
		lastRotateY = 0;
		
		// Should be:
		// Left Button -> Rotate
		// Shift + Left Button -> Pitch/Roll
		// Ctrl + Left Button -> Pan
		// Middle Button -> Pitch/Roll
		// Right Button -> Zoom

		if ( event.button === 0 && !event.ctrlKey && !event.shiftKey) {
			state = STATE.ROTATE;
		} else if (event.button == 0 && event.ctrlKey) {
			state = STATE.PAN;
		} else if (event.button == 0 && event.shiftKey) {
			state = STATE.PITCH_ROLL_YAW;
		} else if ( event.button === 1 ) {
			state = STATE.PITCH_ROLL_YAW;
		} else if ( event.button === 2) {
			state = STATE.ZOOM_SMOOTH;
		} 

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );
	}
	
	function onMouseMove( event ) {
		if (!scope.enabled) return;
	
		event.preventDefault();
		
		if (state === STATE.NONE) {
			return;
		}
		
		var xDelta = event.clientX - lastX;
		var yDelta = event.clientY - lastY;
		
		if ( state === STATE.ROTATE ) {
			scope.rotate( (yDelta * (Math.PI / 180)), (xDelta * (Math.PI / 180)) );
		} else if ( state === STATE.ZOOM ) {
			_adjustDistanceByDelta(-yDelta);
		} else if ( state === STATE.ZOOM_SMOOTH) {
			_adjustDistanceByDelta(event.clientY - mouseDownY);
		} else if ( state === STATE.PAN ) {
			scope.pan(yDelta, DIRECTION.VERTICAL);
			scope.pan(-xDelta, DIRECTION.HORIZONTAL);
		} else if ( state === STATE.PITCH_ROLL_YAW ) {
			scope.pitch(yDelta * (Math.PI / 180));
			scope.roll(xDelta * (Math.PI / 180));
		}
		
		lastX = event.clientX;
		lastY = event.clientY;
		
		if (onChange) {
			onChange(scope);
		}
	}
	
	function onMouseUp( event ) {
		if (!scope.enabled) return;
		
		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		
		
		mouseDownX = -1;
		mouseDownY = -1;
		lastX = -1;
		lastY = -1;
		state = STATE.NONE;
		
		if (onChange) {
			onChange(scope);
		}
	}
	
	function onMouseWheel( event ) {
		if ( scope.enabled === false ) return;
		
		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
			delta = event.wheelDelta;
		} else if ( event.detail ) { // Firefox
			delta = -event.detail * 20;
		}
		
		_adjustDistanceByDelta(delta);
		
		if (onChange) {
			onChange(scope);
		}
	}
	
	function onKeyDown( event ) {
		
	}
	
	
	
	
	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
	this.domElement.addEventListener( 'keydown', onKeyDown, false );

};

KMG.ExamineControls.prototype = Object.create( THREE.EventDispatcher.prototype );
