
KMG.Planet = function ( domElement, config, sceneCallbacks, cameraConfig, view) {
	
	KMG.Engine.call( this, domElement, config, sceneCallbacks, cameraConfig, view );

	// Internals
	var scope = this;
	

	
	function addObjectToScene(object, scene)
	{
		scope.context.objects.push(object);
		
		if (!scene || scene === KMG.SCENE.PRIMARY) {
			scope.context.primaryScene.add( object );
		} else if (scene === KMG.SCENE.SECONDARY) {
			scope.context.secondaryScene.add( object );
		}
		
		return object;
	}
	
	function initShadows(light) {
		light.castShadow = true;
		light.shadowCameraVisible = false;
		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;
		light.shadowCameraNear = -4000;
		light.shadowCameraFar = 100000;
		light.shadowCameraFov = 45.0;
		
		light.shadowCameraRight     =  700;
		light.shadowCameraLeft     = -700;
		light.shadowCameraTop      =  700;
		light.shadowCameraBottom   = -700;
		//light0.shadowBias = 0.03001;
		//light0.shadowDarkness = 0.5;
	}
	
	function buildScene()
	{
		scope.context.primaryScene = new THREE.Scene();

		scope.context.lights.primaryDirectional = new THREE.DirectionalLight( 0xFFFFFF, 2.0, 100);
		scope.context.lights.primaryDirectional.position.set( -10000, 0, 0 ).normalize();
		scope.context.primaryScene.add(scope.context.lights.primaryDirectional);

			
		
		scope.context.lights.primaryPoint = new THREE.PointLight( 0xFFFFFF, 0.0);
		scope.context.lights.primaryPoint.position.set( 0, 0, 0 );
		scope.context.primaryScene.add(scope.context.lights.primaryPoint);

		scope.context.lights.ambient = new THREE.AmbientLight( 0x888888 );
		scope.context.primaryScene.add( scope.context.lights.ambient );
		
		scope.context.lights.ambient = new THREE.AmbientLight( 0x888888 )
		
		if (scope.config.initWithShadows) {
			initShadows(scope.context.lights.primaryDirectional);
			//initShadows(scope.context.lights.primaryPoint);
		}
		
		
		if (!scope.config.noPlanet) {
			scope.context.surfaceObject = addObjectToScene(new KMG.SurfaceObject(scope.context, scope.config));
			scope.context.cloudObject = addObjectToScene(new KMG.CloudObject(scope.context, scope.config));
			addObjectToScene(new KMG.HaloObject(scope.context, scope.config), KMG.SCENE.PRIMARY);
			addObjectToScene(new KMG.RingObject(scope.context, scope.config));
		}
		if (!scope.config.noFog) {
			scope.context.primaryScene.fog = addObjectToScene(new KMG.FogObject(scope.context, scope.config), KMG.SCENE.NONE);
		}
		
		scope.context.secondaryScene = new THREE.Scene();
		
		scope.context.lights.secondaryDirectional = scope.context.lights.primaryDirectional.clone();
		scope.context.lights.secondaryPoint = scope.context.lights.primaryPoint.clone();

		scope.context.secondaryScene.add(scope.context.lights.secondaryDirectional);
		scope.context.secondaryScene.add(scope.context.lights.secondaryPoint);
		
		
		
		addObjectToScene(new KMG.LocalStarObject(scope.context, scope.config), KMG.SCENE.SECONDARY);
		addObjectToScene(new KMG.LensFlareObject(scope.context, scope.config), KMG.SCENE.SECONDARY);
		
		if (!scope.config.noBackground) {
			scope.context.background = new KMG.BackgroundObject(scope.context, scope.config);
			addObjectToScene(scope.context.background, KMG.SCENE.SECONDARY);
		}
		

		
		scope.context.primaryScene.updateMatrix();
		scope.context.secondaryScene.updateMatrix();
	}
	
	
	
	buildScene();
	
	this.initializePostProcessing();
	
	
};
KMG.Planet.prototype = Object.create( KMG.Engine.prototype );
