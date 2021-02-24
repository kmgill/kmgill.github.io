
KMG.DefaultMoonConfig = {
	id : "",
	displayMoon : true,
	moonTexture : KMG.textures[14].name,
	moonColorMode : "Normal",
	moonHue : 0.5,
	moonSaturation : 0.0,
	moonLightness : 0.75,
	moonSurfaceDetail : 0.2,
	moonElevationScale : 0,
	moonShininess : 60,
	moonDiffuseIntensity : 90,
	moonSpecularIntensity : 0,
	moonAmbientIntensity : 8,
	moonEmissiveIntensity : 0,
	moonDistance : 1.0,
	moonScale : 1.0,
	moonAngle : 45,
	moonRotation : 160.0,
	shadows : false
};

KMG.MoonObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultMoonConfig);
	this.context = context;
	var scope = this;
	
	var shader = KMG.ExtendedNormalMapShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog : false };
	var material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;
	material.blending = THREE.AdditiveBlending;

	//var geometry = new THREE.SphereGeometry( 75, 64, 64 );
	var geometry = new THREE.IcosahedronGeometry( 75, 4 );
	geometry.computeTangents();
	
	var mesh = new THREE.Mesh( geometry, material );
	//mesh.position = new THREE.Vector3( 0, 0, -1000 );
	

	this.add(mesh);
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;

		this.traverse(function(obj) {
			obj.visible = scope.config.displayMoon;
		});
		
		var texDefinition = KMG.TextureMap.getTextureDefinitionByName(scope.config.moonTexture);
		if (texDefinition) {
			var tDiffuse = null;
			if (texDefinition.name == "Webcam") {
				tDiffuse = texDefinition.exture;
			} else {
				tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
			}
			
			var tNormal = (texDefinition.normalMap) ? KMG.TextureMap.loadTexture(texDefinition.normalMap) : null;
			var tSpecular = (texDefinition.specularMap) ? KMG.TextureMap.loadTexture(texDefinition.specularMap) : null;
			var tDisplacement = (texDefinition.bumpMap) ? KMG.TextureMap.loadTexture(texDefinition.bumpMap) : null;
			
			
			uniforms[ "tDiffuse" ].value = tDiffuse;
			uniforms[ "tNormal" ].value = tNormal;
			uniforms[ "tSpecular" ].value = tSpecular;

			uniforms["tDisplacement"].value = tDisplacement;
			
			if (tNormal) {
				uniforms[ "uNormalScale" ].value.set( this.config.moonSurfaceDetail, this.config.moonSurfaceDetail );
			} else {
				uniforms[ "uNormalScale" ].value.set( 0, 0 );
			}
		}
		
		var diffuseIntensity = KMG.Util.intensityToWhiteColor(this.config.moonDiffuseIntensity);
		var specularIntensity = KMG.Util.intensityToWhiteColor(this.config.moonSpecularIntensity);
		var ambientIntensity = KMG.Util.intensityToWhiteColor(this.config.moonAmbientIntensity);
		

		var diffuse = KMG.Util.intensityToWhiteColor(this.config.moonDiffuseIntensity);
		var specular = KMG.Util.intensityToWhiteColor(this.config.moonSpecularIntensity);
		var ambient = KMG.Util.intensityToWhiteColor(this.config.moonAmbientIntensity);

		uniforms[ "enableAO" ].value = false;
		uniforms[ "enableDiffuse" ].value = true;
		uniforms[ "enableCityLights" ].value = false;
		uniforms[ "enableDisplacement" ].value = true;
		
		uniforms[ "enableSpecular" ].value = (tSpecular != null);
		
		var grayScale = false;
		var inverted = false;
		switch (this.config.moonColorMode) {
		case "Normal":
			// Keep both as false
			break;
		case "Grayscale":
			grayScale = true;
			break;
		case "Inverted":
			inverted = true;
			break;
		case "Inverted Grayscale":
			grayScale = true;
			inverted = true;
			break;
		};
		
		uniforms[ "enableGrayscale" ].value = grayScale;
		uniforms[ "uInvertedColor" ].value = inverted;

		

		
		uniforms["uDisplacementScale"].value = this.config.moonElevationScale;
	
		var hslColor = new THREE.Color(0xFFFFFF);
		hslColor.setHSL(this.config.moonHue, this.config.moonSaturation, this.config.moonLightness);
		
		var hslEmissiveColor = new THREE.Color(0xFFFFFF);
		hslEmissiveColor.setHSL(this.config.moonHue, this.config.moonSaturation, this.config.moonLightness);
		hslEmissiveColor.multiplyScalar( this.config.moonEmissiveIntensity / 255.0 );
		
		uniforms[ "uDiffuseColor" ].value = hslColor;
		uniforms[ "uSpecularColor" ].value = specular ;
		uniforms[ "uAmbientColor" ].value = ambient ;
		uniforms[ "uEmissiveColor" ].value = hslEmissiveColor;
		uniforms[ "uShininess" ].value = this.config.moonShininess;
		
		uniforms[ "wrapRGB" ].value = new THREE.Vector3(this.config.moonAmbientIntensity/255, this.config.moonAmbientIntensity/255, this.config.moonAmbientIntensity/255); 
		
		mesh.rotation.set(0, this.config.moonRotation*(Math.PI/180.0), 0.0);
		mesh.scale.set(this.config.moonScale, this.config.moonScale, this.config.moonScale);
		this.position = new THREE.Vector3( 0, 0, -1000 );
		this.position.multiplyScalar(this.config.moonDistance);
		this.position.rotateY(this.config.moonAngle*(Math.PI/180.0));
		mesh.castShadow = scope.config.shadows;
		mesh.receiveShadow = scope.config.shadows;
	};
};
KMG.MoonObject.prototype = Object.create( KMG.BaseObject.prototype );
