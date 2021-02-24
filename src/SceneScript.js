








KMG.SceneScript = function(source) {
	
	var scope = this;
	var planet, config, context;
	this.source = source;
	
	// TODO:  Add some error handling...
	eval(source);
	
	if (!onFrame) {
		var onFrame = function(planet, config, context) { }
	}
	
	if (!onRender) {
		var onRender = function(planet, config, context) { }
	}
	
	if (!onScriptInitialize) {
		var onScriptInitialize = function(planet, config, context) { }
	}
	
	if (!onScriptDestroy) {
		var onScriptDestroy = function(planet, config, context) { }
	}
	
	var _onFrame = onFrame;
	var _onRender = onRender;
	var _onScriptInitialize = onScriptInitialize;
	var _onScriptDestroy = onScriptDestroy;
	
	function radians(deg) {
		return deg * KMG.PI_BY_180;
	}
	
	function degrees(rad) {
		return rad * KMG._180_BY_PI;
	}
	
	function rotatePlanet(r) {
		config.surfaceRotation += r;
		context.configChanged = true;
	}
	
	function rotateScene(r) {
		context.controls.rotate(0, radians(r) );
	}
	
	function rotateMoon(moonIndex, r) {
		config.moons[moonIndex].moonRotation += r;
		context.configChanged = true;
	}
	
	function rotateMoons(r) {
		for (var i = 0; i < config.moons.length; i++) {
			if (r instanceof Array) {
				rotateMoon(i, r[i]);
			} else {
				rotateMoon(i, r);
			}
		}
	}
	
	function advanceMoonOrbit(moonIndex, r) {
		config.moons[moonIndex].moonAngle += r;
		context.configChanged = true;
	}
	
	function advanceMoonOrbits(r) {
		for (var i = 0; i < config.moons.length; i++) {
			if (r instanceof Array) {
				advanceMoonOrbit(i, r[i]);
			} else {
				advanceMoonOrbit(i, r);
			}
		}
	}
	
	function addToPrimaryScene(obj) {
		context.objects.push(obj);
		context.primaryScene.add(obj);
	}
	
	function addToSecondaryScene(obj) {
		context.objects.push(obj);
		context.secondaryScene.add(obj);
	}
	
	this.onScriptInitialize = function(_planet, _config, _context) {
		planet = _planet;
		config = _config;
		context = _context;
		
		if (_onScriptInitialize) {
			return _onScriptInitialize(planet, config, context);
		} else {
			return false;
		}
	};
	
	this.onScriptDestroy = function(planet, config, context) {
		if (_onScriptDestroy) {
			return _onScriptDestroy(planet, config, context);
		} else {
			return false;
		}
	};
	
	this.onFrameHandler = function(planet, config, context) {
		if (_onFrame) {
			return _onFrame(planet, config, context);
		} else {
			return false;
		}
	};
	
	this.onRenderHandler = function(planet, config, context) {
		if (_onRender) {
			return _onRender(planet, config, context);
		} else {
			return false;
		}
	};

};

