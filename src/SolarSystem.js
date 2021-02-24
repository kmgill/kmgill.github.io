




KMG.SolarSystemNavigationController = function(modelConfig) {
	
	var configs = [modelConfig];
	
	var initialUrl = document.location.href.split(/[?#]/)[0];
	
	var navListeners = [];
	
	var enabled = true;
	
	window.onpopstate = function(event) {
		if (event.state) {
			fireNavigationListener(event.state);
		}
	};
	
	function setEnabled(e) {
		enabled = e;
	}
	
	function isEnabled() {
		return enabled;
	}
	
	function buildQueryString() {
		var qs = "#";
		
		for (var i = 0; i < configs.length; i++) {
			var config = configs[i];
			for (var name in config) {
				var value = config[name];
				qs += name + "=" + value + "&";
			}
		}
		
		return qs;
	}
	
	function buildState() {
		
		var state = KMG.Util.clone(modelConfig);
		return state;
	}
	
	
	function pushState() {
		if (!enabled) {
			return;
		}
		var title = "";
		var stateObj = buildState();
		var query = buildQueryString();
		window.history.pushState(stateObj, title, initialUrl + query); 
	};
	
	function fireNavigationListener(state) {
		for (var i = 0; i < navListeners.length; i++) {
			navListeners[i](state);
		}
	};
	
	function addNavigationListener(listener) {
		navListeners.push(listener);
	};
	
	function addConfig(config) {
		configs.push(config);
	};

	return {
		setEnabled : setEnabled,
		isEnabled : isEnabled,
		pushState : pushState,
		addConfig : addConfig,
		addNavigationListener : addNavigationListener
		
	};
	
};




// Reserved Colors:
// 0xFF0000 - Red:               Active focus orbit
// 0xFFFFFF - White:             Spacecraft orbits
// 0x304FFF - Light Blue:        Generic orbits
// 0x006600 - Darker Green:      Ecliptic
// 0x33CC66 - Teal:              Equatorial
// 0xCC9999 - Purple:            Azimuthal
KMG.OrbitColors = [
	0x999999, // Grey
	0xFFCCFF, // Light Pink
	0xFFFF99, // Light Yellow
	0x6666CC, // Light Watery Blue
	0x8A4D43, // Darkish Redish
	0xFFCC99,  // Light Orangish?
	0xCCFFFF, // Powder Blue
	0x33FFFF, // Cyan
	0xFF00FF, // Purple
	0x990000, // Maroon
	0xFF9900, // Orange
	0xFFFF00, // Yellow
	0x0000FF, // Blue
	0x99FF00, // Lime Green
	0xCC9999, // Light Purple
	//0x33CC66, // Teal
	0x00FF00, // Bright Green
	//0x006600, // Darker Green
	//0xFFFFFF, // White
	0xCCCCCC, // Light grey
	0xFF0099, // Pink
];







KMG.OrbitDisplay = {};
KMG.OrbitDisplay.All = 1;
KMG.OrbitDisplay.MajorPlanets = 2;
KMG.OrbitDisplay.MinorPlanets = 4;
KMG.OrbitDisplay.Moons = 8;
KMG.OrbitDisplay.Focus = 16;

KMG.activeOrbitDisplays = function(v) {
	var displays = [];
	for (var i in KMG.OrbitDisplay) {
		if (v & KMG.OrbitDisplay[i]) {
			displays.push(KMG.OrbitDisplay[i]);
		}
	}

	return displays;
};




KMG.DefaultSolarSystemConfig = {
	initWithShadows : false,
	shadows : false,
	shadowDarkness : 0.8,
	kmScalar : 0.000005,
	textureResolution : "1024x768",
	enableFps : true,
	camera : {
		positionZ : 700,
		fieldOfView : 45,
		near : 2,
		far : 100000000
	},
	canvas : {
		forceResolution : false,
		width : 1920,
		height : 1080
	}
};


KMG.SolarSystem = function ( domElement, config, sceneCallbacks ) {

	this.config = config;
	this.sceneCallbacks = sceneCallbacks;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	
	
	var lookingAt = "Sun";
	var lookingFrom = "Free";
	var fieldOfView = 45;
	var orbitLinesVisible = true;
	
	var primaryCameraPosition = new THREE.Vector3(0, 0, 0);
	var secondaryCameraPosition = new THREE.Vector3(0, 0, 0);
	
	var frameNumber = 0;
	var saveFrames = false;
	
	var loadableObjects = [];
	var loadableSatellites = [];
	
	var viewFromType = "Geocentric";
	var topocentricLatitude = 0;
	var topocentricLongitude = 0;
	
	var orientUpToEcliptic = false;
	
	var doSaveAttachment = {
		saveNextFrame : false,
		objectId : null, 
		credit : null,
		source : null,
		authorization : null,
		callback : null
	};
	
	
	var context = {
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
		planets : {},
		animationID : 0,
		background : null,
		tickController : null,
		mouse : {
			x : 0,
			y : 0,
			clientX : 0,
			clientY : 0
		},
		lights : {
			ambient : null,
			primaryPoint : null,
			secondaryPoint : null
		}
	};
	this.context = context;
	
	//var scope = this;

	function onWindowResize() 
	{
		context.windowHalfX = $("#container").width() / 2;
		context.windowHalfY = $("#container").height() / 2;
		
		context.containerWidth = $("#container").width();
		context.containerHeight = $("#container").height();
		
		context.camera.aspect = $("#container").width() / $("#container").height();
		context.camera.updateProjectionMatrix();

		context.renderer.setSize( $("#container").width(), $("#container").height() );
	}
	
	function onDocumentMouseMove( event ) 
	{
		context.mouse.clientX = event.clientX;
		context.mouse.clientY = event.clientY;
		context.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		context.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}
	
	function onDocumentMouseClickHandler( event, callback ) {
		onDocumentMouseMove(event);
		
		var sceneOffsetVector = getFocusPointVector(lookingAt);
		var scale = (lookingFrom == "Free") ? context.controls.scale : 1;
		
		for (var name in context.planets) {
			var obj = context.planets[name];
			if (obj.isAtScreenPosition && obj.isAtScreenPosition(context.mouse.x, context.mouse.y, sceneOffsetVector, 0.033, scale)) {

				if (callback) {
					callback(scope, obj);
				}
				
				update();
				return;
				
			}
		}
	}
	
	function onDocumentMouseClick( event ) {
		onDocumentMouseClickHandler( event, sceneCallbacks.onObjectClicked );
	}
	
	
	function onDocumentMouseDoubleClick( event ) {
		onDocumentMouseClickHandler( event, sceneCallbacks.onObjectDoubleClicked );
	}
	
	function addObjectToPrimaryScene(object)
	{
		context.objects.push(object);
		context.primaryScene.add( object );
		
		return object;
	}
	
	function addObjectToSecondaryScene(object) {
		context.objects.push(object);
		context.secondaryScene.add( object );
		return object;
	}
	
	
	
	function createObject(data) {
		
		var centerObject = null;
		if (data.orbiting) {
			centerObject = context.planets[data.orbiting];
		}
		
		var vectorsOrbiting;
		if (data.vectors.orbiting) {
			vectorsOrbiting = context.planets[data.vectors.orbiting];
		} else {
			vectorsOrbiting = centerObject;
		}
		
		var elementsOrbiting;
		if (data.elements.orbiting) {
			elementsOrbiting = context.planets[data.elements.orbiting];
		} else {
			elementsOrbiting = centerObject;
		}
		
		// Suppress future (keplerian orbital elements) for all objects except satellites
		var suppressFuture = (data.type == "satellite") ? false : true;

		var object = new KMG.OrbitingObject(context, {kmScalar : config.kmScalar, elementsOrbitColor : 0x999999, suppressFuture : suppressFuture, useFadingVectorPath : true, suppressDatesOfInterest : true, suppressSpacecraftModels : true}, data, tickController, vectorsOrbiting, elementsOrbiting, centerObject);
		context.objects.push(object);
		centerObject.addChild(object);
		
		object.setFutureOrbitVisibility((data.type == "satellite" || data.type == "asteroid"));
		object.setUsingFadingLine((data.type != "satellite" && data.type != "comet"));
		object.name = data.name;
		object.level = 0;
		object.id = data._id;
		object.orbiting = elementsOrbiting;
		context.planets[data.name] = object;
		
		if (data.name == lookingAt) {
			setLookingAt(lookingAt);
		}
		
		update();
		
		if (sceneCallbacks.onObjectLoaded) {
			sceneCallbacks.onObjectLoaded(scope, data, object);
		}
	}
	

	
	
	function findLoadableById(id) {
		for (var n in context.planets) {
			if (context.planets[n].id == id) {
				return context.planets[n];
			}
		}
		return null;
	}
	
	function loadRemoteObject(url, suppressFuture) {
		$.ajax({
			url: url,
			dataType: "json",
			error: function( jqXHR, textStatus, errorThrown ) {
				console.warn("Error: " + errorThrown);
			
			},
			success: function(data, textStatus, jqxhr) {
				
			}
		}).done(function(data) {
			createObject(data, suppressFuture);
		});
	}
	
	function tleBasedToEarthOrbiting(tle) {
		var data = {};
		data.displayFuture = true;
		data.links = [];
		data.origin = "tle/celestrak";
		data.type = "satellite";
		data.orbiting = "Earth";
		data.vectors = { data : [] };
		data.elements = {
			orbiting : "Earth",
			data : tle
		};
		data.datesOfInterest = [];
		data.model = {
			file : "generic",
			scale : 1
		};
		data._id = tle.satelliteNumber;
		data.name = tle.name;
		data.start = tle.epoch;
		data.isDebris = false;
		data.initialEyeDistance = 0.0000732369465053;
		return data;
	}
	
	function loadTleBased(tle) {
		
		var data = tleBasedToEarthOrbiting(tle);
		console.info(data);
		createObject(data, false);
	}
	
	function load(id) {
		
		var loadable = findLoadableById(id);
		
		if (loadable) {
			
			if (loadable.orbiting) {
				loadable.orbiting.addChild(loadable);
			} else {
				context.primaryScene.add( loadable );
			}
			
			
		} else {
			loadRemoteObject("/api/data/" + id);
		}
	}
	
	
	
	function unload(id) {
		var loadable = findLoadableById(id);
		if (loadable.orbiting) {
			loadable.orbiting.removeChild(loadable);
		} else {
			context.primaryScene.remove( loadable );
			update();
		}
		
	}

	
	function start() {
		tickController.start();
	}
	
	function stop() {
		tickController.stop();
	}
	
	function isActive() {
		return tickController.isActive();
	}
	
	function setToDateMillis(date) {
		tickController.resetToDate(date);
	}
	
	
	function setViewFromType(type) {
		viewFromType = type;
		//update();
	}
	
	function setTopocentricLatitude(lat) {
		topocentricLatitude = lat;
		//update();
	}
	
	function setTopocentricLongitude(lon) {
		topocentricLongitude = lon;
		//update();
	}
	
	function setOrientUpToEcliptic(upToEcliptic) {
		orientUpToEcliptic = upToEcliptic;
	}
	
	function setTimeWarp(timeWarp) {
		tickController.speed = timeWarp;
	}
	
	function setLookingAt(name) {
		lookingAt = name.replace(/\.\.\./g, "");
		
		for (var n in context.planets) {
			if (context.planets[n].setIsFocus) {
				context.planets[n].setIsFocus(false);
			}
		}
		if (context.planets[lookingAt] && context.planets[lookingAt].setIsFocus) {
			context.planets[lookingAt].setIsFocus(true);
		} 
		update();
	}
	
	
	
	function setLookingFrom(name) {
		
		if (lookingFrom != "Free" && name == "Free") {
			context.primaryCamera.position = primaryCameraPosition;
			context.secondaryCamera.position = secondaryCameraPosition;
			context.controls._update(true);
		} else if (name != "Free") {
			primaryCameraPosition = context.primaryCamera.position;
			secondaryCameraPosition = context.secondaryCamera.position;
		}
		
		lookingFrom = name.replace(/\.\.\./g, "");

	}
	
	function setAnimationSpeed(speed) {
		tickController.speed = speed;
	}
	
	function setFieldOfView(fov) {
		fieldOfView = fov;
	}
	
	function setEclipticVisibility(visible) {
		eclipticLine.setVisibility(visible);
	}
	
	function setEquatorialVisibility(visible) {
		equatorialLine.setVisibility(visible);
	}
	
	function setAzimuthalVisibility(visible) {
		azimuthalLine.setVisibility(visible);
	}
	
	function setTopocentricIndicatorVisible(visible) {
		topoCentricPositionIndicator.setVisibility(visible);
	}
	
	function getPlanet(name) {
		return context.planets[name];
	}
	
	function setSavingFrames(save) {
		saveFrames = save;
		
		update();
	}
	
	function saveAttachment(objectId, credit, source, authorization, callback) {
		
		doSaveAttachment.saveNextFrame = true;
		doSaveAttachment.objectId = objectId;
		doSaveAttachment.credit = credit;
		doSaveAttachment.source = source;
		doSaveAttachment.authorization = authorization;
		doSaveAttachment.callback = callback;
		
	}
	
	function getObjects() {
		var objects = [];
		for (var name in context.planets) {
			objects.push(context.planets[name]);
		}
		return objects;
	}
	
	function getObjectNames() {
		var names = [];
		
		for (var name in context.planets) {
			names.push(name);
		}
		
		return names;
	}
	
	
	function setOrbitLinesVisibility(visible) {
		orbitLinesVisible = visible;
		for (var name in context.planets) {
			if (context.planets[name] && context.planets[name].setOrbitLinesVisibility) {
				context.planets[name].setOrbitLinesVisibility(visible);
			}
		}
		
		update();
	}

	function getFocusPointVector(name) {
		var focusPoint;
		
		if (context.planets[name] && context.planets[name].getPlanetVector) {
			focusPoint = context.planets[name].getPlanetVector();
		} else if (context.planets[name] && context.planets[name].getPosition){
			focusPoint = context.planets[name].getPosition();
		} else {
			focusPoint = new THREE.Vector3(0, 0, 0);
		}
		
		return focusPoint;
	}
	
	function getViewerLocationVector(name, _locType) {
		var vector;
		
		if (!_locType) {
			_locType = viewFromType;
		}
		
		if (context.planets[name] && context.planets[name].getPlanetVector && _locType == "Geocentric") {
			vector = context.planets[name].getPlanetVector();
		} else if (context.planets[name] && context.planets[name].getPlanetTopocentricVector && _locType == "Topocentric") {
			vector = context.planets[name].getPlanetTopocentricVector(topocentricLatitude, topocentricLongitude, context.tickController.tickJulian);
		} else if (context.planets[name] && context.planets[name].getPosition){
			vector = context.planets[name].getPosition();
		} else {
			vector = new THREE.Vector3(0, 0, 0);
		}
		
		return vector;
	}
	
	
	function setStarNameVisibility(visible) {
		stars.setTextVisibility(visible);
	};
	
	function setConstellationVisibility(visible) {
		constellations.setVisibility(visible);
	};
	
	function setStarsVisibility(visible) {
		stars.setVisibility(visible);
	};
	
	function updateTopocentricPositionIndicator()
	{
		var from = getViewerLocationVector(lookingFrom != "Free" ? lookingFrom : "Earth", "Topocentric");
		topoCentricPositionIndicator.position = from;
		
	}
	
	function updateAzimuthalLineOrientation() {
		var from = getViewerLocationVector(lookingFrom != "Free" ? lookingFrom : "Earth", "Geocentric");
		azimuthalLine.position = from;
		
		
		var to = getViewerLocationVector(lookingFrom != "Free" ? lookingFrom : "Earth", "Topocentric");
		azimuthalLine.lookAt(to);
	}
	
	
	function updateView()
	{
		var at = getFocusPointVector(lookingAt);
		var lookingFromObject = context.planets[lookingFrom != "Free" ? lookingFrom : "Earth"];
		
		if (lookingFrom == "Free") {
			
			context.primaryScene.position = at.clone().negate().multiplyScalar(context.controls.scale);
			context.primaryScene.scale.set(context.controls.scale, context.controls.scale, context.controls.scale);
			context.primaryScene.updateMatrix();

			context.primaryCamera.near = 2.0;
			context.primaryCamera.updateProjectionMatrix();

		} else {
			context.primaryScene.scale.set(1, 1, 1);
			
			var from = getViewerLocationVector(lookingFrom);
			
			var up;
			
			if (orientUpToEcliptic) {
				up = new THREE.Vector3(0, 1, 0);
			} else {
				var geoFrom = getViewerLocationVector(lookingFrom, "Geocentric");
				var topFrom = getViewerLocationVector(lookingFrom, "Topocentric");
				topFrom.sub(geoFrom);
				up = topFrom;
			}
			context.primaryCamera.position = from;
			context.primaryCamera.up = up;
			context.primaryCamera.lookAt(at);

			var secondaryFrom = from.clone().normalize();
			context.secondaryCamera.position = from;
			context.secondaryCamera.up = up;
			context.secondaryCamera.lookAt(at);
			
			context.primaryScene.position = new THREE.Vector3(0, 0, 0);
			context.primaryScene.updateMatrix();

			var distance = from.distanceTo(at);
			if (distance < 2 || lookingFrom == "Saturn") {
				context.primaryCamera.near = 0.001;
			} else if (distance > 1000) {
				context.primaryCamera.near = 20;
			} else {
				context.primaryCamera.near = 2;
			}
			context.primaryCamera.fov = fieldOfView;
			context.primaryCamera.updateProjectionMatrix();
			
			context.secondaryCamera.fov = fieldOfView;
			context.secondaryCamera.updateProjectionMatrix();
			
			
			
		}
		
		
		
		if (lookingFromObject && lookingFromObject.applyObliquityToObject) {
			lookingFromObject.applyObliquityToObject(equatorialLine);
		}
		
		
		context.primaryScene.updateMatrix();
		context.secondaryScene.updateMatrix();
		
	}
	
	function update() {

		for (var name in context.planets) {
			if (context.planets[name].updatePosition) {
				context.planets[name].updatePosition();
			}
		}
		
		for (var i = 0; i < context.objects.length; i++) {
			context.objects[i].update();
		}

	}
	
	
	function animate() 
	{	
		
		
		if (lookingFrom == "Free") {
			context.controls.update();
		}
		
		if (config.enableFps && context.stats) {
			context.stats.update();
		}
		

		render();
		
		context.animationID = requestAnimationFrame( animate );
	}



	function render() {	

		context.tickController.update();
		
		var sceneOffsetVector = getFocusPointVector(lookingAt);
		var scale = (lookingFrom == "Free") ? context.controls.scale : 1;
		for (var i = 0; i < context.objects.length; i++) {

			if (context.objects[i].onMousePosition) {
				context.objects[i].onMousePosition(context.mouse.x, context.mouse.y, context.mouse.clientX, context.mouse.clientY, sceneOffsetVector.clone(), scale);
			}
		}
		
		if (sceneCallbacks.onRender) {
			sceneCallbacks.onRender(scope, context);
		}
		
		updateAzimuthalLineOrientation();
		updateTopocentricPositionIndicator();
		updateView();
		
		/*
		if (context.planets["Sun"] && context.planets[lookingAt]) {

			var scenePos = context.primaryScene.position.clone().multiplyScalar(1/context.controls.scale).negate();
			var targetPos = context.planets[lookingAt].getPlanetVector().multiplyScalar(1/context.controls.scale);
			var targetLight = context.lights.primaryDirectional;
			targetLight.position = scenePos;
			targetLight.target.position = targetPos;
		}
		*/
		
		//var time = Date.now() * 0.0004;
		//context.composer.render( time );
		
		context.renderer.clear();
		context.renderer.render(context.primaryScene, context.primaryCamera);
		context.renderer.render(context.secondaryScene, context.secondaryCamera);
		
		//doSaveAttachment: objectId, credit, source, authorization, saveNextFrame
		if (doSaveAttachment.saveNextFrame) {
			var dataUrl	= context.renderer.domElement.toDataURL("image/jpeg");
			
			$.ajax({
				url: "/api/attachment/" + doSaveAttachment.objectId,
				type : "POST",
				data : { name : "OrbitView.jpg", 
						credit : doSaveAttachment.credit,
						source : doSaveAttachment.source,
						authorization : doSaveAttachment.authorization,
						data : dataUrl }
			}).done(function(data) {
				
				if (doSaveAttachment.callback) {
					doSaveAttachment.callback(true);
				}
				
			});
			
			doSaveAttachment.saveNextFrame = false;
		}
		
		
		
		if (saveFrames) {
			//if (context.tickController.isActive() || frameNumber > 0 && context.tickController.tickJulian < 2456689.499988) {
	
				var dataUrl	= context.renderer.domElement.toDataURL("image/jpeg");
				/*
				
				
				var canvas1 = document.createElement('canvas');
				var context1 = canvas1.getContext('2d');
				canvas1.width = 1920;
				canvas1.height = 1080;
				
				context1.drawImage(context.renderer.domElement, 0, 0, 1920, 1080, 0, 0, 1920, 1080);
				context1.font = "40px sans-serif";
				context1.fillStyle = "rgba(255,255,255,0.95)";

				context1.textAlign="left";				
				context1.fillText(moment(context.tickController.tickDate).format("LLL") + " UTC"
									, 10
									, 60);
				
				var dataUrl	= canvas1.toDataURL("image/jpeg");
				*/
				$.ajax({
					url: "/api/saveframe/",
					type : "POST",
					data : { fn : frameNumber++, data : dataUrl }
				}).done(function(data) {
				
				});
				
			//}
		}
		
		
	}

	context.container = this.domElement;
	
	KMG.TextureMap.textureResolution = "1024x512";
	KMG.TextureMap.sceneReadyCallback = this.sceneCallbacks.sceneReadyCallback;
	KMG.TextureMap.resourceLoadingStart = this.sceneCallbacks.resourceLoadingStart;
	KMG.TextureMap.resourceLoadingFinish = this.sceneCallbacks.resourceLoadingFinish;
	KMG.TextureMap.renderCallback = render;

	var canvasWidth = (config.canvas.forceResolution) ? config.canvas.width : $("#container").width();
	var canvasHeight = (config.canvas.forceResolution) ? config.canvas.height : $("#container").height();


	context.primaryCamera = new THREE.PerspectiveCamera( config.camera.fieldOfView, canvasWidth / canvasHeight, config.camera.near, config.camera.far );
	context.primaryCamera.forceDefaultDistance = false;
	context.camera = context.primaryCamera;
	
	context.secondaryCamera = new THREE.PerspectiveCamera( config.camera.fieldOfView, canvasWidth / canvasHeight, config.camera.near, config.camera.far / config.kmScalar );
	context.secondaryCamera.forceDefaultDistance = true;
	
	
	var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, preserveDrawingBuffer : true} );
	renderer.setSize( canvasWidth, canvasHeight );
	
	if (config.initWithShadows) {
		console.info("Enabling shadows on renderer");
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = false;
		renderer.shadowMapType = THREE.PCFSoftShadowMap;
		renderer.shadowMapCullFace = THREE.CullFaceFront;
		//renderer.shadowMapAutoUpdate = true;
	}
	
	renderer.autoClear = false;
	renderer.setClearColor(0x000000);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.physicallyBasedShading = true;
	
	context.renderer = renderer;
	renderer.context.canvas.addEventListener("webglcontextlost", function(event) {
		event.preventDefault();
		console.error("WebGL Context has been lost!");
		if (context.animationID) {
			//cancelAnimationFrame(context.animationID); 
		}
		
		if (sceneCallbacks.contextLostCallback) {
			sceneCallbacks.contextLostCallback(event);
		}
		
	}, false);

	renderer.context.canvas.addEventListener("webglcontextrestored", function(event) {
		animate();
	}, false);

	
	context.container.appendChild( renderer.domElement );
	
	if (config.enableFps) {
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '0px';
		stats.domElement.style.right = '0px';
		context.container.appendChild( stats.domElement );
		context.stats = stats;
	}
	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'click', onDocumentMouseClick, false );
	document.addEventListener( 'dblclick', onDocumentMouseDoubleClick, false );
	window.addEventListener( 'resize', onWindowResize, false );

	
	
	context.controls = new KMG.ExamineControls( renderer.getContext(), [context.primaryCamera, context.secondaryCamera], context.container, function(controls) {
		if (sceneCallbacks.onViewChanged) {
			sceneCallbacks.onViewChanged(scope, controls);
		}
	});
	context.controls.rotate(30 * (Math.PI / 180), 0);
	context.controls.setMinDistance(0.013);
	context.controls.setMaxDistance(500000000000000000);
	context.controls.setDistance(2 * KMG.AU_TO_KM * config.kmScalar);
	context.controls.setMaxScale(9999999999999999);
	context.controls.setMinScale(0.001 );
	context.controls.zoomType = KMG.Scale;
	
	if (config.view) {
		context.controls.fromConfig(config.view);
	}
	context.controls.update(true);
	
	context.controls.addEventListener( 'change', render );
	
	/*
	context.controls = new THREE.OrbitControls(context.primaryCamera, context.container);
	context.controls.scale = 1.0;
	*/
	
	primaryCameraPosition = context.primaryCamera.position;
	secondaryCameraPosition = context.secondaryCamera.position;
	
	

	//context.controls = {};
	//context.controls.scale = 1.0;



	
	context.primaryScene = new THREE.Scene();
	context.secondaryScene = new THREE.Scene();
		
	context.lights.primaryPoint = new THREE.PointLight( 0xFFFFFF, 1.0);
	context.lights.primaryPoint.position.set( 0, 0, 0 );
	context.primaryScene.add(context.lights.primaryPoint);
	
	context.lights.ambient = new THREE.AmbientLight( 0x111111 );
	context.primaryScene.add( context.lights.ambient );
	
	/*
	context.lights.primaryDirectional = new THREE.DirectionalLight( 0xFFFFFF, 2.0, 100);
	context.lights.primaryDirectional.position.set( 1, 0, 1 ).normalize();
	context.lights.primaryDirectional.castShadow = true;
	context.lights.primaryDirectional.shadowCameraVisible = true;
	context.lights.primaryDirectional.shadowMapWidth = 2048;
	context.lights.primaryDirectional.shadowMapHeight = 2048;
	context.lights.primaryDirectional.shadowDarkness = 1.0;
	context.lights.primaryDirectional.shadowCameraNear = 1700;//7500;
	context.lights.primaryDirectional.shadowCameraFar = 1400;//7900;
	context.lights.primaryDirectional.shadowCameraFov = 0.003;
	context.lights.primaryDirectional.shadowBias = 0.0001;
	context.lights.primaryDirectional.shadowCameraRight     =  20;
	context.lights.primaryDirectional.shadowCameraLeft     = -20;
	context.lights.primaryDirectional.shadowCameraTop      =  20;
	context.lights.primaryDirectional.shadowCameraBottom   = -20;
	context.lights.primaryDirectional.onlyShadow = true;
	context.primaryScene.add(context.lights.primaryDirectional);
	
	

	context.lights.spotLight = new THREE.SpotLight( 0xffffff, 1.0, 11000, 0);
	context.lights.spotLight.position.set( 100, 1000, 100 );
	context.lights.spotLight.castShadow = true;
	context.lights.spotLight.shadowCameraVisible = true;
	context.lights.spotLight.distance = 11000;
	context.lights.spotLight.shadowMapWidth = 2048;
	context.lights.spotLight.shadowMapHeight = 2048;
	context.lights.spotLight.shadowCameraFov = 0.2;
	context.lights.spotLight.shadowBias = 0.0001;
	context.lights.spotLight.shadowCameraRight     =  20;
	context.lights.spotLight.shadowCameraLeft     = -20;
	context.lights.spotLight.shadowCameraTop      =  20;
	context.lights.spotLight.shadowCameraBottom   = -20;
	context.lights.spotLight.onlyShadow = true;
	//context.primaryScene.add(context.lights.spotLight);
	*/
	
	context.lights.secondaryPoint = context.lights.primaryPoint.clone();
	context.secondaryScene.add(context.lights.secondaryPoint);
	/*
	var fps = 30;
	var tickInterval = (1 / fps) / 24;
	var tickController = new KMG.IntervalTimeBasedTickController(1, tickInterval, function(tickJulian, tickDate) {
		update();
	});
	*/

	var tickController = new KMG.TimeBasedTickController(1 + (1000000 * 0.1), function(tickJulian, tickDate) {
		update();
	});
	
	context.tickController = tickController;

	var stars = new KMG.CatalogStarsObject(context, {alphaMultiplier : 9.5, namesVisible : true}, function(instance) {
		if (sceneCallbacks.onStarsLoaded) {
			sceneCallbacks.onStarsLoaded(scope, instance);
		}
	});
	stars.scale.set(1 / config.kmScalar, 1 / config.kmScalar, 1 / config.kmScalar);
	addObjectToSecondaryScene(stars);
	
	var constellations = new KMG.ConstellationLines(context, {}, function(instance) {
		if (sceneCallbacks.onConstellationsLoaded) {
			sceneCallbacks.onConstellationsLoaded(scope, instance);
		}
	});
	constellations.scale.set(1 / config.kmScalar, 1 / config.kmScalar, 1 / config.kmScalar);
	addObjectToSecondaryScene(constellations);
	
	
	var topoCentricIndicatorConfig = {
		opacity : 1.0,
		color : 0xFFFFFF,
		radius : 100 * config.kmScalar,
		ambient : 0xFFFFFF,
		emissive : 0xFFFFFF,
		texture : 'Sun'
	};
	var topoCentricPositionIndicator= new KMG.TexturedSphereObject(context, topoCentricIndicatorConfig);
	addObjectToPrimaryScene(topoCentricPositionIndicator);
	
	
	var eclipticLine = new KMG.CoordinateGrid(context, {}); 
	addObjectToSecondaryScene(eclipticLine);
	
	var equatorialLine = new KMG.CoordinateGrid(context, {color: 0x33CC66});
	addObjectToSecondaryScene(equatorialLine);
	
	var azimuthalLine = new KMG.CoordinateGrid(context, {color: 0xCC9999});
	azimuthalLine.secondaryContainer.rotation.x = KMG.RAD_90;
	addObjectToSecondaryScene(azimuthalLine);
	
	$.ajax({
		url: "/api/majorbodies/list/",
		dataType: "json",
		error: function( jqXHR, textStatus, errorThrown ) {
			console.warn("Error: " + errorThrown);
		
		},
		success: function(data, textStatus, jqxhr) {
			
		}
	}).done(function(data) {

		var colorIndex = 0;
		for (var i = 0; i < data.length; i++) {
			var def = data[i];
			
			
			var color = 0x304FFF;
			if (KMG.OrbitColors.length > colorIndex && def.type == "planet") {
				color = KMG.OrbitColors[colorIndex];
				colorIndex++;
			}
			
			var p = new KMG.SolarSystemPlanet(context, {kmScalar : config.kmScalar, orbitColor : color}, def, tickController);
			addObjectToPrimaryScene(p);
			
		}
		
		update();
		
		if (sceneCallbacks.onPlanetsLoaded) {
			sceneCallbacks.onPlanetsLoaded(scope);
		}
	});
	
	// Loadable objects
	$.ajax({
		url: "/api/tracked/list/?max=-1",
		dataType: "json",
		error: function( jqXHR, textStatus, errorThrown ) {
			console.warn("Error: " + errorThrown);
		
		},
		success: function(data, textStatus, jqxhr) {
			
		}
	}).done(function(data) {
		
		loadableObjects = [];
		
		for (var i = 0; i < data.length; i++) {
			
			loadableObjects.push(data[i]);
			
		}

		update();
		
		if (sceneCallbacks.onLoadableObjectsListLoaded) {
			sceneCallbacks.onLoadableObjectsListLoaded(loadableObjects);
		}
	});
	

	update();
	animate();
	

	var scope = {
		context : context,
		start : start,
		stop : stop,
		update : update,
		isActive : isActive,
		setToDateMillis : setToDateMillis,
		load : load,
		loadTleBased : loadTleBased,
		unload : unload,
		setLookingAt : setLookingAt,
		setLookingFrom : setLookingFrom,
		getObjects : getObjects,
		getObjectNames : getObjectNames,
		setAnimationSpeed : setAnimationSpeed,
		setOrbitLinesVisibility : setOrbitLinesVisibility,
		setFieldOfView : setFieldOfView,
		getPlanet : getPlanet,
		setTimeWarp : setTimeWarp,
		setSavingFrames : setSavingFrames,
		setStarNameVisibility : setStarNameVisibility,
		setViewFromType : setViewFromType,
		setTopocentricLatitude : setTopocentricLatitude,
		setTopocentricLongitude : setTopocentricLongitude,
		setTopocentricIndicatorVisible : setTopocentricIndicatorVisible,
		setEclipticVisibility : setEclipticVisibility,
		setEquatorialVisibility : setEquatorialVisibility,
		setAzimuthalVisibility : setAzimuthalVisibility,
		setOrientUpToEcliptic : setOrientUpToEcliptic,
		setConstellationVisibility : setConstellationVisibility,
		setStarsVisibility : setStarsVisibility,
		saveAttachment : saveAttachment
	};
	return scope;
};
