
KMG.StarUtil = {};
KMG.StarUtil.colorForSpectralClass = function(code) {
	if (code == "O")
		return 0x9db4ff;
	else if (code == "B")
		return 0xaabfff;
	else if (code == "A")
		return 0xcad8ff;
	else if (code == "F")
		return 0xfbf8ff;
	else if (code == "G")
		return 0xfff4e8;
	else if (code == "K")
		return 0xffddb4;
	else if (code == "M")
		return 0xffbd6f;
	else if (code == "L")
		return 0xf84235;
	else if (code == "T")
		return 0xba3059;
	else if (code == "Y")
		return 0x605170;
	else // Including D,C,W,S,N,P for now until I get some concrete colors on these
		return 0xFFFFFF;
}



KMG.StarParticlesShader = {

	uniforms: THREE.UniformsUtils.merge( [
		{
			"tParticle"	   : { type: "t", value: null },
			"vAlpha": { type: "f", value: 0.15 },
			"vSizeMultiplier": { type: "f", value:3.5 },
			"color" : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }
		}]),

	vertexShader: [
		'attribute float alpha;',
		'varying float vAlpha;',
		'uniform float vSizeMultiplier;',
		'void main() {',
		'	vAlpha = alpha;',
		'	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
		'	gl_PointSize = (vSizeMultiplier * alpha);',
		'	gl_Position = projectionMatrix * mvPosition;',
		'}'
	].join("\n"),

	fragmentShader: [
		"uniform sampler2D tParticle;",
		'uniform vec3 color;',
		'varying float vAlpha;',
		'varying float vSizeMultiplier;',
		'void main() {',
		'	gl_FragColor = vec4( color, vAlpha );',
		'	gl_FragColor = gl_FragColor * texture2D( tParticle, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) );',
		'}'
	].join("\n")

};


KMG.DefaultSpectralTypeStarParticleSystemOptions = {
	texture : '/img/star_particle.png',
	radius : 90000.0,
	sizeMultiplier : 6.5
};

KMG.SpectralTypeStarParticleSystem = function(context, config, typeCode) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultSpectralTypeStarParticleSystemOptions);
	this.context = context;
	var scope = this;
	
	var particleTexture = KMG.TextureMap.loadTexture(config.texture);
	particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.format = THREE.RGBAFormat;
	particleTexture.needsUpdate = true;
	
	var geometry = new THREE.Geometry();

	var shader = KMG.StarParticlesShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "color" ].value = KMG.Util.rgbToArray(KMG.StarUtil.colorForSpectralClass(typeCode));
	uniforms[ "vSizeMultiplier" ].value = config.sizeMultiplier;
	uniforms[ "tParticle" ].value = particleTexture;
	
	var attributes = {
        alpha: { type: 'f', value: [] }
    };
	
	var material = new THREE.ShaderMaterial( {
        uniforms:       uniforms,
        attributes:     attributes,
        vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
        transparent:    true
    });
	

	this.addStar = function(vertex, visualMagnitude) {	
		
		
		var alpha = 1.0 - ((visualMagnitude + 1.46) / 9.42);
		alpha = (alpha * 0.85) + (0.15);
		
		attributes.alpha.value.push(alpha);
		
		
		vertex.magnitude = visualMagnitude;
		geometry.vertices.push( vertex );
	};
	
	this.build = function() {
		var particles = new THREE.ParticleSystem( geometry, material );
		scope.add(particles);
	
	};
	
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
		uniforms[ "vSizeMultiplier" ].value = this.config.sizeMultiplier;
		
	};
};
KMG.SpectralTypeStarParticleSystem.prototype = Object.create( KMG.BaseObject.prototype );




KMG.DefaultCatalogStarsObjectOptions = {
	radius : 90000.0,
	namesVisible : false
};
KMG.DefaultCatalogStarsObjectOptions = KMG.Util.extend(KMG.DefaultCatalogStarsObjectOptions, KMG.DefaultSpectralTypeStarParticleSystemOptions);


KMG.CatalogStarsObject = function ( context, config, onLoaded ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultCatalogStarsObjectOptions);
	this.context = context;
	var scope = this;
	
	var particleTexture = KMG.TextureMap.loadTexture('/img/star_particle.png');
	particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.format = THREE.RGBAFormat;
	
	var names = [];
	
	var spectralTypes = {};
	this.add(spectralTypes["O"] = new KMG.SpectralTypeStarParticleSystem(context, config, "O"));
	this.add(spectralTypes["B"] = new KMG.SpectralTypeStarParticleSystem(context, config, "B"));
	this.add(spectralTypes["A"] = new KMG.SpectralTypeStarParticleSystem(context, config, "A"));
	this.add(spectralTypes["F"] = new KMG.SpectralTypeStarParticleSystem(context, config, "F"));
	this.add(spectralTypes["G"] = new KMG.SpectralTypeStarParticleSystem(context, config, "G"));
	this.add(spectralTypes["K"] = new KMG.SpectralTypeStarParticleSystem(context, config, "K"));
	this.add(spectralTypes["M"] = new KMG.SpectralTypeStarParticleSystem(context, config, "M"));
	this.add(spectralTypes["L"] = new KMG.SpectralTypeStarParticleSystem(context, config, "L"));
	this.add(spectralTypes["T"] = new KMG.SpectralTypeStarParticleSystem(context, config, "T"));
	this.add(spectralTypes["Y"] = new KMG.SpectralTypeStarParticleSystem(context, config, "Y"));
	
	
	this.add(spectralTypes["D"] = new KMG.SpectralTypeStarParticleSystem(context, config, "D"));
	this.add(spectralTypes["C"] = new KMG.SpectralTypeStarParticleSystem(context, config, "C"));
	this.add(spectralTypes["W"] = new KMG.SpectralTypeStarParticleSystem(context, config, "W"));
	this.add(spectralTypes["S"] = new KMG.SpectralTypeStarParticleSystem(context, config, "S"));
	this.add(spectralTypes["N"] = new KMG.SpectralTypeStarParticleSystem(context, config, "N"));
	this.add(spectralTypes["P"] = new KMG.SpectralTypeStarParticleSystem(context, config, "P"));

	// With respect to the equatorial pole
	// North pole:
	//	Right Ascension:  12h 51.4m
	//  Declination:      27.13 deg

	// South Pole:
	//  Right Ascension:  0h 51.4m
	//  Declination:      -27.13 deg
	
	// Galactic Center (0 deg longitude)
	//  Right Ascension:  17h 45.5m
	//  Declination:      -28.94 deg

	function createSystemForSpectralClass(classCode) {
	
	
	
	};
	
	
	function createStarLabel(vertex, name) {
		
		var text = new KMG.BillBoardTextObject(context, KMG.Util.replaceWithGreekLettersAbbreviated(name), {font : "8px sans-serif", fillStyle : "rgba(200,200,200,0.95)"});
		text.position = vertex.clone();
		scope.add(text);
		names.push(text);
		
	};
	
	
	$.ajax({
		url: "/api/stars/list/",
		dataType: "json",
		error: function( jqXHR, textStatus, errorThrown ) {
			console.warn("Error: " + errorThrown);
		
		},
		success: function(data, textStatus, jqxhr) {
			
		}
	}).done(function(data) {

		
		var lbls = 0;
		for (var i = 0; i < data.length; i++) {
			
			var vMag = data[i].Vmag;
			var l = data[i].eclLon;
			var b = data[i].eclLat;
			var specClass = data[i].SpClass.toUpperCase();
			var name = data[i].name;
			
			if (spectralTypes[specClass]) {

				var vertex = KMG.Math.getPoint3D(l, b, config.radius);
				
				spectralTypes[specClass].addStar(vertex, vMag);
				
				if (name.length > 0 && vMag < 6.0) {
					
					name = name.replace(/^[0-9]+/, "");
					if (vMag > 3) {
						name = name.replace(/[ ][A-Za-z]{3}$/i, "");
					}
					
					if (name.length > 0) {
						createStarLabel(vertex, name);
						lbls++;
					}
				}
				
				
			} else {
				console.warn("No particle system for spectral type " + specClass);
			}
		}
		
		console.info("Added " + lbls + " star labels");
		for (var key in spectralTypes) {
			spectralTypes[key].build();
		}
		
		scope.setTextVisibility(config.namesVisible);
		
		if (onLoaded) {
			onLoaded(scope);
		}
		
	});
	
	this.setTextVisibility = function(visible) {
		
		for (var i = 0; i < names.length; i++) {
			names[i].setVisibility(visible);
		}
		
	};
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		this.setTextVisibility(config.namesVisible);
		
		for (var key in spectralTypes) {
			spectralTypes[key].update();
		}
	};
};
KMG.CatalogStarsObject.prototype = Object.create( KMG.BaseObject.prototype );
