

KMG.SCENE = { NONE : -1, PRIMARY : 0, SECONDARY : 1 };

KMG.Engine = function ( domElement, config, sceneCallbacks, cameraConfig, view ) {

	this.config = config;
	this.sceneCallbacks = sceneCallbacks;
	this.cameraConfig = cameraConfig;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	
	
	this.context = {
		composer : null,
		container : null, 
		stats : null,
		camera : null, 
		secondaryCamera : null,
		primaryScene : null,
		secondaryScene : null,
		renderer : null,
		controls : null,
		windowHalfX : window.innerWidth / 2,
		windowHalfY : window.innerHeight / 2,
		containerWidth : 0,
		containerHeight : 0,
		objects : [],
		configChanged : true,
		moons : [],
		animationID : 0,
		script : null,
		background : null,
		lights : {
			ambient : null,
			primaryDirectional : null,
			secondaryDirectional : null,
			primaryPoint : null,
			secondaryPoint : null
		}
	};
	
	this.animators = [];
	
	this.stopAnimation = false;
	
	// Internals
	var scope = this;
	
	this.reset = function()
	{
	
	};
	
	
	
	function onWindowResize() 
	{
		scope.context.windowHalfX = $("#container").width() / 2;
		scope.context.windowHalfY = $("#container").height() / 2;
		
		scope.context.containerWidth = $("#container").width();
		scope.context.containerHeight = $("#container").height();
		
		scope.context.camera.aspect = $("#container").width() / $("#container").height();
		scope.context.camera.updateProjectionMatrix();

		scope.context.renderer.setSize( $("#container").width(), $("#container").height() );
	
		//scope.context.composer.reset();
	}
	
	function onDocumentMouseMove( event ) 
	{
		scope.context.mouseX = ( event.clientX - scope.context.windowHalfX );
		scope.context.mouseY = ( event.clientY - scope.context.windowHalfY );
	}
	
	this.start = function()
	{
		animate();
	};
	
	this.stop = function()
	{
		this.stopAnimation = true;
	
	};
	
	function checkGlError()
	{
		var err = scope.context.renderer.getContext().getError();
		if (err !== 0) {
			onWebGlException("WebGL Error Code " + err);
		}
	}
	
	function onWebGlException(ex)
	{
		if (scope.sceneCallbacks.webGlErrorCallback) {
			scope.sceneCallbacks.webGlErrorCallback(ex);
		}
	}
	

	
	function animate() 
	{	

		if (scope.stopAnimation) {
			scope.stopAnimation = false;
			
			if (scope.sceneCallbacks.animationStoppedCallback) {
				scope.sceneCallbacks.animationStoppedCallback();
			}
			
			return;
		}
		

		scope.context.animationID = requestAnimationFrame( animate );
		
		if (scope.config.useScript && fireOnFrameHandler()) {
			scope.context.configChanged = true;
		}
		
		
		for (var i = 0; i < scope.animators.length; i++) {
			var animator = scope.animators[i];
			animator.next();
		}

		scope.context.controls.update();
		
		
		if (scope.config.enableFps && scope.context.stats) {
			scope.context.stats.update();
		}
		

		render();
	}
	
	
	function updateDirectionalLight(configChanged, light)
	{
		
		if (scope.config.realtimeSunlight) {
			var positioner = new KMG.SunlightPositioning();
			
			// I'm not sure this is 100% correct... Need more validation...
			var sunlightDateTime = new Date(scope.config.sunlightDate);
			
			var position = positioner.getSunPositionOnDate(sunlightDateTime);
			light.position = position;
		}
	
		if (configChanged) {
			
			if (scope.config.lightingType === "Point") {
				light.intensity = 0.0;
				return;
			} else {
				light.intensity = 2.0;
			}
			
			
		
			var localStarLightColor = null;
			
			if (config.starColorAffectsPlanetLighting) {
				localStarLightColor = KMG.Util.arrayToColor(config.localStarColor);
			} else {
				localStarLightColor = new THREE.Color(0xFFFFFF);
			}
			light.color = localStarLightColor;
			
			if (!scope.config.realtimeSunlight) {
				light.position = new THREE.Vector3(-10000.0, 0, 0);
				light.position.rotateY(scope.config.sunlightDirection*(Math.PI/180.0)).normalize();
			}
				
			light.castShadow = scope.config.shadows;
				
			light.shadowDarkness = scope.config.shadowDarkness;
			light.updateMatrix();
		}
	
		
	}
	
	function updatePointLight(configChanged, light)
	{
		if (configChanged) {
			
			if (scope.config.lightingType === "Directional") {
				light.intensity = 0.0;
				return;
			} else {
				light.intensity = 2.0;
			}
			
			
			
			var localStarLightColor = null;
			
			if (config.starColorAffectsPlanetLighting) {
				localStarLightColor = KMG.Util.arrayToColor(config.localStarColor);
			} else {
				localStarLightColor = new THREE.Color(0xFFFFFF);
			}
			light.color = localStarLightColor;
		}

	}
	
	function updateLights(configChanged)
	{
		updateDirectionalLight(configChanged, scope.context.lights.primaryDirectional);
		updateDirectionalLight(configChanged, scope.context.lights.secondaryDirectional);
		updatePointLight(configChanged, scope.context.lights.primaryPoint);
		updatePointLight(configChanged, scope.context.lights.secondaryPoint);
	}
	
	function updateShadows()
	{
		if (!scope.context.configChanged) {
			return;
		}
		
		scope.context.renderer.shadowMapEnabled = scope.config.shadows;
		scope.context.renderer.shadowMapAutoUpdate = scope.config.shadows;
		
		if (!scope.config.shadows) {
			for (var i = 0; i < scope.context.lights.length; i++) {
				scope.context.renderer.clearTarget( scope.context.lights[i].shadowMap );
			}
		}
	}
	
	function areEffectsEnabled() {
		return (scope.config.enableBlur
			|| scope.config.enableBloom
			|| scope.config.enableBleach
			|| scope.config.enableFilm
			|| scope.config.enableSepia);
	}
	
	function render() 
	{	
	
		if (scope.config.ringAngle + scope.config.axialTilt > 0.0) {
			renderer.shadowMapCullFace = THREE.CullFaceFront;
		} else {
			renderer.shadowMapCullFace = THREE.CullFaceBack;
		}
		
		if (scope.context.configChanged) {
			for (var i = 0; i < scope.context.moons.length; i++) {
				scope.context.moons[i].config.shadows = scope.config.shadows;
			}
		}
		
		updateShadows();
		
		scope.context.containerWidth = $("#container").width();
		scope.context.containerHeight = $("#container").height();
		KMG.TextureMap.textureResolution = scope.config.textureResolution;

		updateLights(scope.context.configChanged);
		
		for (var i = 0; i < scope.context.objects.length; i++) {
			scope.context.objects[i].update();
		}
		
		scope.context.configChanged = false;

		var time = Date.now() * 0.0004;
		
		if (scope.config.useScript) {
			fireOnRenderHandler();
		}
		
		if (areEffectsEnabled() && scope.config.postprocessingEnabled) {
			scope.context.composer.render( time );
		} else {
			scope.context.renderer.clear();
			scope.context.renderer.render(scope.context.secondaryScene, scope.context.secondaryCamera);
			scope.context.renderer.render(scope.context.primaryScene, scope.context.camera);
		}
		
		
		

	}
	
	function configContainsMoon(moonConfig)
	{
		if (!scope.config.moons) {
			return false;
		}
		for (var i = 0; i < scope.config.moons.length; i++) {
			if (scope.config.moons[i].id == moonConfig.id) {
				return true;
			}
		}
		return false;
	}
	
	this.addMoon = function(moonConfig)
	{
		if (!moonConfig) {
			moonConfig = $.extend(true, {}, KMG.DefaultConfig.moonTemplate);
		}
		
		if (!moonConfig.id) {
			moonConfig.id = KMG.GUID.guid();
		}
		
		if (!this.config.moons) {
			this.config.moons = [];
		}
		
		if (!configContainsMoon(moonConfig)) {
			this.config.moons.push(moonConfig);
		}
		
		var moonObject = new KMG.MoonObject(scope.context, moonConfig);
		scope.context.objects.push(moonObject);
		scope.context.primaryScene.add(moonObject);
		
		var moonContainer = {
			id : moonConfig.id,
			config : moonConfig,
			object : moonObject
		};
		
		this.context.moons.push(moonContainer);
		
		
		return moonContainer;
	};
	
	function getMoonContainerById(id) 
	{
		for (var i = 0; i < scope.context.moons.length; i++) {
			if (scope.context.moons[i].id == id) {
				return scope.context.moons[i];
			}
		}
		return null;
	}
	
	this.removeMoon = function(moonConfig) 
	{
		var moonContainer = getMoonContainerById(moonConfig.id);
		if (!moonContainer) {
			return;
		}
		
		// Remove moon config
		var newList = [];
		for (var i = 0; i < this.config.moons.length; i++) {
			if (this.config.moons[i].id != moonConfig.id) {
				newList.push(this.config.moons[i]);
			}
		}
		this.config.moons = newList;
		
		// Remove moon object container from context & scene
		newList = [];
		for (var i = 0; i < scope.context.moons.length; i++) {
			if (scope.context.moons[i].id != moonContainer.id) {
				newList.push(scope.context.moons[i]);
			}
		}
		scope.context.moons = newList;
		scope.context.primaryScene.remove(moonContainer.object);
		
		
	};
	
	function fireOnFrameHandler()
	{
		if (scope.config.useScript && scope.context.script && scope.context.script.onFrameHandler) {
			return scope.context.script.onFrameHandler(scope, scope.config, scope.context);
		} else {
			return false;
		}
	}
	
	function fireOnRenderHandler()
	{
		if (scope.config.useScript && scope.context.script && scope.context.script.onRenderHandler) {
			return scope.context.script.onRenderHandler(scope, scope.config, scope.context);
		} else {
			return false;
		}
	}
	
	this.applySceneScriptInstance = function(scriptInstance) {
		
		var sceneChanged = false;
		if (this.context.script && this.context.script.onScriptDestroy(this, this.config, this.context)) {
			sceneChanged = true;
		}
		
		this.context.script = scriptInstance;
		
		// Make sure we weren't passed a null script instance (which effectively 
		// disables the script interface)
		if (this.context.script && this.context.script.onScriptInitialize(this, this.config, this.context)) {
			sceneChanged = true;
		}
		
		if (sceneChanged) {
			this.context.configChanged = true;
		}
	};
	
	
	this.context.container = this.domElement;
	
	
	KMG.TextureMap.sceneReadyCallback = this.sceneCallbacks.sceneReadyCallback;
	KMG.TextureMap.resourceLoadingStart = this.sceneCallbacks.resourceLoadingStart;
	KMG.TextureMap.resourceLoadingFinish = this.sceneCallbacks.resourceLoadingFinish;
	KMG.TextureMap.renderCallback = render;

	this.context.camera = new THREE.PerspectiveCamera( this.config.camera.fieldOfView, $("#container").width() / $("#container").height(), this.config.camera.near, this.config.camera.far );
	this.context.camera.forceDefaultDistance = false;
	
	if (this.config.camera.useSecondaryParameters) {
		this.context.secondaryCamera = new THREE.PerspectiveCamera( this.config.camera.fieldOfViewSecondary, $("#container").width() / $("#container").height(), this.config.camera.nearSecondary, this.config.camera.farSecondary );
	} else {
		this.context.secondaryCamera = new THREE.PerspectiveCamera( this.config.camera.fieldOfView, $("#container").width() / $("#container").height(), this.config.camera.near, this.config.camera.far );
	}
	this.context.secondaryCamera.forceDefaultDistance = true;
	
	
	var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, preserveDrawingBuffer : true} );
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	if (this.config.initWithShadows) {
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;
		renderer.shadowMapType = THREE.PCFSoftShadowMap;
		renderer.shadowMapCullFace = THREE.CullFaceBack;
	}
	
	renderer.autoClear = false;
	renderer.setClearColor(0x000000);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.physicallyBasedShading = true;
	
	this.context.renderer = renderer;
	renderer.context.canvas.addEventListener("webglcontextlost", function(event) {
		event.preventDefault();
		console.error("WebGL Context has been lost!");
		if (scope.context.animationID) {
			//cancelAnimationFrame(scope.context.animationID); 
		}
		
		if (sceneCallbacks.contextLostCallback) {
			sceneCallbacks.contextLostCallback(event);
		}
		
	}, false);

	renderer.context.canvas.addEventListener("webglcontextrestored", function(event) {
		animate();
	}, false);

	
	this.context.container.appendChild( renderer.domElement );
	
	if (this.config.enableFps) {
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.right = '0px';
		this.context.container.appendChild( stats.domElement );
		this.context.stats = stats;
	}
	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );


	this.context.controls = new KMG.ExamineControls( renderer.getContext(), [this.context.camera, this.context.secondaryCamera], this.context.container );
	if (view) {
		this.context.controls.fromConfig(view);
	}
	this.context.controls.update(true);
	
	this.context.controls.addEventListener( 'change', render );
	if (this.cameraConfig != null && this.cameraConfig.controlCenter !== undefined) {
		this.context.controls.center.set(this.cameraConfig.controlCenter.x, this.cameraConfig.controlCenter.y, this.cameraConfig.controlCenter.z);
	}
	
	
	this.initializePostProcessing = function() {
		this.context.composer = new KMG.DynamicEffectsComposer(this.context, this.context.primaryScene, this.context.camera, this.context.secondaryCamera, this.context.renderer, this.config);
		this.context.objects.push(this.context.composer);
	};
	
	
	
	
	
	
};
