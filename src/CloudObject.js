

KMG.DefaultCloudConfig = {
	cloudsTexture : KMG.clouds[1].name,
	displayClouds : true,
	cloudsHue : 0.5,
	cloudsSaturation : 0.0,
	cloudsLightness : 0.75,
	cloudsDetail : 0.6,
	cloudsElevation : 0.25,
	cloudsThickness : 0,
	cloudsOpacity : 1.0,
	cloudsCastShadows : true,
	cloudsShadowLevel : 0.8,
	cloudsDiffuseIntensity : 170,
	cloudsSpecularIntensity : 4,
	cloudsAmbientIntensity : 60

};

KMG.CloudObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultCloudConfig);
	this.context = context;
	var scope = this;
	
	
	//var geometry = new THREE.SphereGeometry( scope.config.cloudsRadius, 64, 32 );
	var geometry = new THREE.IcosahedronGeometry( scope.config.cloudsRadius, 5 );
	geometry.computeTangents();
	
	var shader = KMG.ExtendedNormalMapShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	
	var parameters = { 
		fragmentShader: shader.fragmentShader, 
		vertexShader: shader.vertexShader, 
		uniforms: uniforms, 
		lights: true, 
		fog : true, 
		transparent: true,
		depthWrite: false, 
		depthTest: true,
		blending : THREE.AdditiveBlending
	};
	var material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;

	var mesh = new THREE.Mesh( geometry, material );
	
	mesh.position = new THREE.Vector3( 0, 0, 0 );

	this.add(mesh);
	
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
		this.traverse(function(obj) {
			obj.visible = scope.config.displayClouds;
		});
		if (!mesh.visible) {
			return;
		}
		
		
		var texDefinition = KMG.TextureMap.getCloudDefinitionByName(scope.config.cloudsTexture);
		var tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		var tBumpMap = (texDefinition.bumpMap) ? KMG.TextureMap.loadTexture(texDefinition.bumpMap) : null;
		var tNormals = (texDefinition.normalMap) ? KMG.TextureMap.loadTexture(texDefinition.normalMap) : null;
	
		tDiffuse.format = THREE.RGBAFormat;
		
		var hslColor = new THREE.Color(0xFFFFFF);
		hslColor.setHSL(this.config.cloudsHue, this.config.cloudsSaturation, this.config.cloudsLightness);
		
		var diffuse = KMG.Util.intensityToWhiteColor(this.config.cloudsDiffuseIntensity);
		var specular = KMG.Util.intensityToWhiteColor(this.config.cloudsSpecularIntensity);
		var ambient = KMG.Util.intensityToWhiteColor(this.config.cloudsAmbientIntensity);
		
		uniforms[ "enableAO" ].value = false;
		uniforms[ "enableDiffuse" ].value = true;
		uniforms[ "enableSpecular" ].value = false;
		uniforms[ "enableCityLights" ].value = false;
		uniforms[ "enableDisplacement" ].value = true;
		
		uniforms[ "tDiffuse" ].value = tDiffuse;
		uniforms[ "tNormal" ].value = tNormals;
		uniforms["tDisplacement"].value = tBumpMap;
		
		uniforms["enableFog"].value = this.config.displayAtmosphere;
		uniforms[ "uAlphaMulitplier" ].value = this.config.cloudsOpacity;
		
		uniforms[ "uDiffuseColor" ].value = hslColor;
		//uniforms[ "uDiffuseColor" ].value = diffuse;
		uniforms[ "uSpecularColor" ].value = specular ;
		uniforms[ "uAmbientColor" ].value = ambient ;
		
		uniforms["usingDirectionalLighting"].value = (this.config.lightingType === "Directional");
		
		if (tNormals) {
			uniforms[ "uNormalScale" ].value.set( this.config.cloudsDetail, this.config.cloudsDetail );
		} else {
			uniforms[ "uNormalScale" ].value.set( 0, 0 );
		}
		uniforms["uDisplacementScale"].value = this.config.cloudsThickness;

		
		var scale = 1.0 + this.config.cloudsElevation / 100.0;
		mesh.scale.set(scale, scale, scale);
		
		// Doesn't really work this way, but visually, it's close enough
	//	this.scale.y = (1.0 - this.config.flattening) * scale;
		this.scale.set(this.config.scaleSurface * scale, (this.config.scaleSurface - this.config.flattening) * scale, this.config.scaleSurface * scale);
		this.rotation.y = 180 * (Math.PI / 180);
		this.rotation.z = -this.config.axialTilt * (Math.PI/180);
		
		mesh.rotation.set(0, this.config.surfaceRotation*(Math.PI/180.0), 0.0);
		mesh.castShadow = false;
		mesh.receiveShadow = scope.config.shadows;
	};
};
KMG.CloudObject.prototype = Object.create( KMG.BaseObject.prototype );

