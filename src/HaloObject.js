
KMG.HaloObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;

	
	var shader = THREE.HaloShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	var geometry = new THREE.SphereGeometry( this.config.atmosphereRadius, 96, 96 );
	geometry.computeTangents();
	
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent : true,
		side : THREE.BackSide,
		blending : THREE.AdditiveBlending,
		depthWrite: false, depthTest: true,
		lights: true
	});
	
	//material.blending = THREE.CustomBlending;
	//material.blendSrc = THREE.SrcAlphaFactor;
	//material.blendDst = THREE.OneMinusSrcAlphaFactor;
	//material.blendEquation = THREE.AddEquation;
	
	var mesh = new THREE.Mesh(geometry, material);
	mesh.flipSided = true;
	mesh.matrixAutoUpdate = false;

	mesh.receiveShadow = scope.config.initWithShadows;
	mesh.updateMatrix();
	
	this.add(mesh);
	
	
	function getRadius() {
		return scope.config.atmosphereRadius * scope.context.controls.scale;
	}
	
	function getManipulationMatrix(applyQuaternion, applyPitchAndRoll) {
		
		var radius = getRadius();
	
		var rotation = new THREE.Matrix4();
		rotation.identity();
		
		if (applyQuaternion) {
			rotation.makeRotationFromQuaternion(scope.context.controls.orientation);
		}
		
		if (applyPitchAndRoll) {
			var matrixPitch = new THREE.Matrix4();
			matrixPitch.identity().makeRotationX(-scope.context.controls._pitch);
			
			var matrixRoll = new THREE.Matrix4();
			matrixRoll.identity().makeRotationZ(scope.context.controls._roll);
			matrixRoll.multiply(matrixPitch);
			
			var translateMatrix = new THREE.Matrix4();
			translateMatrix.makeTranslation(0, 0, radius);
			rotation.multiply( translateMatrix );
			rotation.multiply( matrixRoll );
			
			translateMatrix.makeTranslation(0, 0, -radius);
			rotation.multiply( translateMatrix );
		}
		
		return rotation;
	
	}
	
	function getViewManipulation() {
		return getManipulationMatrix(true, true);
	}
	
	function getPositionManipulation() {
		return getManipulationMatrix(true, false);
	}
	
	function getDistanceToCenter() {
		var origin = new THREE.Vector3(0, 0, 0);
		var distanceToCenter = origin.distanceTo(scope.context.camera.position);
		return distanceToCenter;
	}
	
	function getDistanceToSurface() {
		return getDistanceToCenter() - getRadius();
	}
	
	function getTranslateToHorizonDistance() {
		return getDistanceToCenter() - KMG.Util.horizonDistance(scope.context, getRadius());
	}
	
	
	var pitchRotation = new THREE.Matrix4();
	var rollRotation = new THREE.Matrix4();
	
	this.update = function()
	{
		mesh.visible = this.config.displayAtmosphere;
		if (!this.config.displayAtmosphere) {
			return;
		}
		
		var r = getRadius();
		var p = this.context.controls._pitch;
		var d1 = this.context.controls.distance;
		var d2 = d1 + r * Math.cos(p);
		var h = r * Math.sin(p);
		var d3 = Math.sqrt(Math.pow(d2, 2) + Math.pow(h, 2));
		var a = Math.asin(h / d3);
		var d4 = d3 - r;
		var v = (90 * (Math.PI / 180)) - a;
		var u = a;

		var d5 = Math.sqrt(d4 * (2 * r + d4));
		var b = (90 * (Math.PI / 180)) - Math.acos(r / (r + d4));
		var e = Math.tan(b) * d3;
		
		var distToCntrHeight = Math.sqrt(Math.pow(e, 2)+Math.pow(d2, 2));
		var distPastHorizon = distToCntrHeight - d5;
		var t = Math.cos(b) * distPastHorizon;

		var f = p / 90;
		
		var angle = (b * f) + (u * (1 - f));
		
		pitchRotation.makeRotationX(this.context.controls._pitch - angle);
		rollRotation.makeRotationZ(this.context.controls._roll);
		
		mesh.position = new THREE.Vector3(0, 0, t);
		mesh.position.applyMatrix4(pitchRotation);
		mesh.position.applyMatrix4(rollRotation);
		mesh.position.applyMatrix4(getManipulationMatrix(true, false));
		mesh.updateMatrix();
		
		var pow = 1;// + (3.5 - 1) * (1 - frac);
		var scale = 1.0;//Math.pow(e / r, pow);

		var scaleXZ = scale + this.config.atmosphereScale / 100.0;
		
		// Doesn't really work this way, but visually, it's close enough
		var scaleY = (scale + this.config.atmosphereScale / 100.0) * (1.0 - this.config.flattening);

		mesh.scale.set(scaleXZ, scaleY, scaleXZ);

		var viewer = new THREE.Vector3(0, 0, d1);

		viewer.applyMatrix4(pitchRotation);
		viewer.applyMatrix4(rollRotation);
		viewer.applyMatrix4(getManipulationMatrix(true, false));

		uniforms["viewVector"].value = viewer;
		
		if (this.context.configChanged) {
			var color = new THREE.Vector4(this.config.atmosphereColor[0] / 255.0, this.config.atmosphereColor[1] / 255.0, this.config.atmosphereColor[2] / 255.0, 1.0);
			uniforms["uColor"].value = color;
			uniforms["usingDirectionalLighting"].value = (this.config.lightingType === "Directional");
		}
		
		this.rotation.z = -this.config.axialTilt * (Math.PI/180);
	};
};
KMG.HaloObject.prototype = Object.create( KMG.BaseObject.prototype );

