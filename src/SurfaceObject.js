
KMG.DefaultSurfaceObjectConfig = {
	texture : KMG.textures[1].name,
	surfaceDetail : 1.0,
	elevationScale : 0,
	shininess : 60,
	diffuseIntensity : 170,
	specularIntensity : 4,
	ambientIntensity : 0,
	emissiveIntensity : 0,
	enableCityLights : true,
	cityLightsIntensity : 1.0,
	flattening : 0.0033528,
	axialTilt : 0.0,
	surfaceColorMode : "Normal",
	surfaceHue : 0.5,
	surfaceSaturation : 0.0,
	surfaceLightness : 0.75,
	surfaceWrapRGB : 0.031,
	surfaceRotation : 0.0,
	scaleSurface : 1.0
};

KMG.SurfaceObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSurfaceObjectConfig);
	this.context = context;
	var scope = this;
	
	var imageUtils = new KMG.ImageUtils();
	
	//var geometry = new THREE.SphereGeometry( scope.config.radius, 256, 256 );
	var geometry = new THREE.IcosahedronGeometry( scope.config.radius, 6 );
	geometry.computeTangents();
	
	var ambient = 0x000000, diffuse = 0xFFFFFF, specular = 0x040404, shininess = 15;

	var shader = KMG.ExtendedNormalMapShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	var parameters = { 
		fragmentShader: shader.fragmentShader
		, vertexShader: shader.vertexShader
		, uniforms: uniforms
		, lights: true
		, fog : true
		, shading : THREE.SmoothShading
		, alphaTest : 0.2
		//, wireframe : true
	};
	var material = new THREE.ShaderMaterial( parameters );
	material.wrapAround = true;

	var mesh = new THREE.Mesh( geometry, material );
	mesh.position = new THREE.Vector3( 0, 0, 0 );
	this.position = new THREE.Vector3( 0, 0, 0 ); 
	
	this.props = {
		mesh : mesh,
		material : material,
		geometry : geometry
	};
	this.rotation.y = 180 * (Math.PI / 180);
	
	this.add(mesh);
	
	var lastCapture = (new Date()).getTime();
	
	
	this.update = function()
	{
		var texDefinition = KMG.TextureMap.getTextureDefinitionByName(this.config.texture);
	
		if (!this.context.configChanged && !(texDefinition.name === "Webcam")) {
			return;
		}
	
		var tDiffuse = null;
		if (texDefinition.name == "Webcam") {
			tDiffuse = texDefinition.texture;
		} else {
			tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
		}
		
		
		var tNormal = (texDefinition.normalMap) ? KMG.TextureMap.loadTexture(texDefinition.normalMap) : null;
		var tSpecular = (texDefinition.specularMap) ? KMG.TextureMap.loadTexture(texDefinition.specularMap) : null;
		var tCityLights = KMG.TextureMap.loadTexture(KMG.lights[0].texture);
		var tDisplacement = (texDefinition.bumpMap) ? KMG.TextureMap.loadTexture(texDefinition.bumpMap) : null;
		
		var tAO = null;
		if (this.config.displayClouds && this.config.cloudsCastShadows) {
			var cloudTexDefinition = KMG.TextureMap.getCloudDefinitionByName(this.config.cloudsTexture);
			tAO = (cloudTexDefinition.aoMap) ? KMG.TextureMap.loadTexture(cloudTexDefinition.aoMap) : null;
		}
		
		var diffuseIntensity = KMG.Util.intensityToWhiteColor(this.config.diffuseIntensity);
		var specularIntensity = KMG.Util.intensityToWhiteColor(this.config.specularIntensity);
		var ambientIntensity = KMG.Util.intensityToWhiteColor(this.config.ambientIntensity);
		

		var diffuse = KMG.Util.intensityToWhiteColor(this.config.diffuseIntensity);
		var specular = KMG.Util.intensityToWhiteColor(this.config.specularIntensity);
		var ambient = KMG.Util.intensityToWhiteColor(this.config.ambientIntensity);
		var emissive = KMG.Util.intensityToWhiteColor(this.config.emissiveIntensity);

		uniforms[ "enableDiffuse" ].value = true;
		uniforms[ "enableDisplacement" ].value = true;
		uniforms[ "enableCityLights" ].value = this.config.enableCityLights;
		
		
		uniforms[ "enableSpecular" ].value = (tSpecular != null);
		uniforms[ "enableAO" ].value = (tAO != null);
		
		var grayScale = false;
		var inverted = false;
		switch (this.config.surfaceColorMode) {
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
		
		
		uniforms[ "tDiffuse" ].value = tDiffuse;
		uniforms[ "tNormal" ].value = tNormal;
		uniforms[ "tSpecular" ].value = tSpecular;
		uniforms[ "tCityLights" ].value = tCityLights;
		uniforms["tDisplacement"].value = tDisplacement;
		uniforms["tAO"].value = tAO;
		
		if (tNormal) {
			uniforms[ "uNormalScale" ].value.set( this.config.surfaceDetail, this.config.surfaceDetail );
		} else {
			uniforms[ "uNormalScale" ].value.set( 0, 0 );
		}
		uniforms["uDisplacementScale"].value = this.config.elevationScale;
	
		
		var hslColor = new THREE.Color(0xFFFFFF);
		hslColor.setHSL(this.config.surfaceHue, this.config.surfaceSaturation, this.config.surfaceLightness);
		
		var hslEmissiveColor = new THREE.Color(0xFFFFFF);
		hslEmissiveColor.setHSL(this.config.surfaceHue, this.config.surfaceSaturation, this.config.surfaceLightness);
		hslEmissiveColor.multiplyScalar( this.config.emissiveIntensity / 255.0 );
		
		
		uniforms["usingDirectionalLighting"].value = (this.config.lightingType === "Directional");
		
		uniforms[ "uDiffuseColor" ].value = hslColor;
		uniforms[ "uSpecularColor" ].value = specular ;
		uniforms[ "uAmbientColor" ].value = ambient ;
		uniforms[ "uEmissiveColor" ].value = hslEmissiveColor;
		uniforms[ "uCityLightsIntensity" ].value = (this.config.cityLightsIntensity <= 5.0) ? this.config.cityLightsIntensity : 5;
		uniforms[ "uShininess" ].value = this.config.shininess;
		
		uniforms[ "uAOLevel" ].value = this.config.cloudsShadowLevel;
		
		uniforms[ "wrapRGB" ].value = new THREE.Vector3(this.config.surfaceWrapRGB, this.config.surfaceWrapRGB, this.config.surfaceWrapRGB); 
		
		uniforms["enableFog"].value = this.config.displayAtmosphere;
		
		mesh.castShadow = scope.config.shadows;
		mesh.receiveShadow = scope.config.shadows;
		
		mesh.rotation.set(0, this.config.surfaceRotation*(Math.PI/180.0), 0.0);
		
		// Doesn't really work this way, but visually, it's close enough
		this.scale.set(this.config.scaleSurface, this.config.scaleSurface - this.config.flattening, this.config.scaleSurface);
		//this.scale.y = scaleSurface - this.config.flattening;
		
		//
		this.rotation.z = -this.config.axialTilt * (Math.PI/180);
	};

};
KMG.SurfaceObject.prototype = Object.create( KMG.BaseObject.prototype );

