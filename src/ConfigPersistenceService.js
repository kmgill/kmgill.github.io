
KMG.DefaultPersistenceServiceConfig = {
	serviceUrl : "/api/models/",
	supportCustomTextures : true,
	supportCustomBackground : true,
	supportSceneScript : false
};

KMG.ConfigPersistenceService = function ( serviceConfig ) {

	this.serviceUrl = (serviceConfig && serviceConfig.serviceUrl) ? serviceConfig.serviceUrl : KMG.DefaultPersistenceServiceConfig.serviceUrl;
	this.supportCustomTextures = (serviceConfig && serviceConfig.supportCustomTextures !== undefined) ? serviceConfig.supportCustomTextures : KMG.DefaultPersistenceServiceConfig.supportCustomTextures;
	this.supportCustomBackground = (serviceConfig && serviceConfig.supportCustomBackground !== undefined) ? serviceConfig.supportCustomBackground : KMG.DefaultPersistenceServiceConfig.supportCustomBackground;
	this.supportSceneScript = (serviceConfig && serviceConfig.supportSceneScript !== undefined) ? serviceConfig.supportSceneScript : KMG.DefaultPersistenceServiceConfig.supportSceneScript;
	
	var scope = this;
	
	function usesCustomTextures(config) {
		if (config.texture === "Custom") {
			return true;
		}
		
		for (var i = 0; i < config.moons.length; i++) {
			if (config.moons[i].moonTexture === "Custom") {
				return true;
			}
		}
		
		return false;
	}
	
	function usesCustomBackground(config) {
		
		// If the image is set to Custom but type is 'stars' with custom backgrounds 
		// disabled, set image to a built-in image tag in serialize function (this  method 
		// does not modify the config).
		if (config.backgroundImage === "Custom" && config.backgroundType === "image") {
			return true;
		}
		
		return false;
	}
	
	function serialize(engine) {
	
		
		
		var texDef = (scope.supportCustomTextures) ? KMG.TextureMap.getTextureDefinitionByName("Custom") : null;
		var bgTexDef = (scope.supportCustomBackground) ? KMG.TextureMap.getBackgroundDefinitionByName("Custom") : null;
		var scriptBase64 = (scope.supportSceneScript) ? Base64.encode(engine.context.script.source) : "";
		
		
		var userModel = {
			config : engine.config,
			camera : {
				type : "PerspectiveCamera",
				fov : engine.context.camera.fov,
				aspect : engine.context.camera.aspect,
				near : engine.context.camera.near,
				far : engine.context.camera.far,
				position : {
					x : engine.context.camera.position.x,
					y : engine.context.camera.position.y,
					z : engine.context.camera.position.z
				},
				rotation : {
					x : engine.context.camera.rotation.x,
					y : engine.context.camera.rotation.y,
					z : engine.context.camera.rotation.z
				}
			},
			view : engine.context.controls.toConfig(),
			customTexture : {
				texture : (texDef) ? texDef.texture : null,
				normalMap : (texDef) ? texDef.normalMap : null,
				specularMap : (texDef) ? texDef.specularMap : null,
				bumpMap : (texDef) ? texDef.bumpMap : null,
				background : (bgTexDef) ? bgTexDef.texture : null,
				sourceProperties : (texDef) ? texDef.sourceProperties : null
			}, 
			sceneScript : 
				(engine.context.script) ? scriptBase64 : null
			
		};

		
		
		var userModel_json = JSON.stringify(userModel);
		return userModel_json;
	}
	
	function deserialize(data) {
		
		
		var loadedConfig = data.config;
		var loadedCameraConfig = data.camera;
		var loadedView = data.view;
		var loadedCustomTextures = data.customTexture;
		var loadedScript = (data.sceneScript) ? Base64.decode(data.sceneScript) : null;
		
		if (!loadedConfig.version) {
			loadedConfig.version = 1.0;
		}
			
		var config = KMG.Util.extend(loadedConfig, KMG.DefaultConfig);
		
		
		return {
			config : config,
			textures : loadedCustomTextures,
			sceneScript : loadedScript,
			view : loadedView,
			camera : loadedCameraConfig
		};
	}
	
	this.save = function(engine, onSuccess, onFailure) {
		
		if (!this.supportCustomTextures && usesCustomTextures(engine.context.config)) {
			if (onFailure) {
				onFailure("Saving with custom textures is not supported");
			}
			return;
		}
		
		if (!this.supportCustomBackground && usesCustomBackground(engine.context.config)) {
			if (onFailure) {
				onFailure("Saving with custom backgrounds is not supported");
			}
			return;
		}
		
		$.ajax({
		  url: scope.serviceUrl,
		  type : "POST",
		  dataType : "json",
		  data : serialize(engine)
		}).done(function(data) {
			
			if (data.status !== undefined && data.status === 200) {
				var modelId = data.id;
				onSuccess(modelId);
			} else if (onFailure) {
				onFailure(data.errormsg);
			}
			
		}).fail(function(data, textStatus, jqXHR) {
			console.info("Error on request: " + textStatus);
			if (onFailure) {
				onFailure(textStatus);
			}
		});
		
	};
	
	this.load = function(id, onSuccess, onFailure) {
		
		$.ajax({
			url: scope.serviceUrl,
			type : "GET",
			data : { id : id }
		}).done(function(data) {
			if (data.status !== undefined && data.status === 200) {
				var result = deserialize(data.data);
				onSuccess(result.config, result.view, result.camera, result.textures, result.sceneScript);
			} else if (onFailure) {
				onFailure(data.errormsg);
			}
		
			
		}).fail(function(data, textStatus, jqXHR) {
			console.info("Error on request: " + textStatus);
			if (onFailure) {
				onFailure(textStatus);
			}
		});
		
		
	};

};


	