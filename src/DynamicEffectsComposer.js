
KMG.DefaultEffectsConfig = {

	enableGodRays : false,
	godRaysIntensity : 0.75,
	
	enableBlur : false,
	blurAmount : 0.5,
	
	enableBloom : false,
	bloomStrength : 0.5,
	
	enableBleach : false,
	bleachAmount : 0.95,
	
	enableSepia : false,
	sepiaAmount : 0.9,
	
	enableFilm : false,
	noiseIntensity : 0.35,
	scanlinesIntensity : 0.75,
	scanlinesCount : 2048,
	filmGrayscale : false
};


KMG.DynamicEffectsComposer = function(context, scene, camera, secondaryCamera, renderer, config) {

	THREE.EffectComposer.call( this, renderer );
	this.context = context;
	this.config = config = KMG.Util.extend(config, KMG.DefaultEffectsConfig);
	var scope = this;
	
	//var fxaaShader = THREE.FXAAShader;
	//var effectFXAA = new THREE.ShaderPass( fxaaShader );
	
	var shaderBleach = THREE.BleachBypassShader;
	var effectBleach = new THREE.ShaderPass( shaderBleach );
	
	var shaderSepia = THREE.SepiaShader;
	var effectSepia = new THREE.ShaderPass( shaderSepia );
	effectSepia.uniforms[ "amount" ].value = 0.9;
	
	//var godRaysPass = new THREE.GodRaysPass(config, context.primaryScene, context.secondaryScene, camera);
	var renderBackgroundPass = new THREE.RenderPass( [context.secondaryScene], secondaryCamera );
	var renderPass = new THREE.RenderPass( context.primaryScene, camera);
	renderPass.clear = false;
	
	var effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	var effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );
	//var effectDotScreen = new THREE.DotScreenPass( new THREE.Vector2( 0, 0 ), 0.5, 0.8 );
	var effectBloom = new THREE.BloomPass(0.5);
	var effectFilm = new THREE.FilmPass( config.noiseIntensity, config.scanlinesIntensity, config.scanlinesCount, config.grayscale );
	effectFilm.renderToScreen = true;
	//effectFXAA.renderToScreen = true;
	
	this.addPass( renderBackgroundPass );
	this.addPass( renderPass );
	//this.addPass( effectFXAA );
	//this.addPass( godRaysPass );

	this.addPass( effectBleach );
	this.addPass( effectBloom );
	this.addPass( effectHBlur );
	this.addPass( effectVBlur );
	this.addPass( effectSepia );
	this.addPass( effectFilm );
	
	
	//this.addPass( effectDotScreen );
	
	this.update = function() {
	
		if (!this.context.configChanged) 
			return;
		
		var width = window.innerWidth || 2;
		var height = window.innerHeight || 2;
		
		//renderPass.enabled = !this.config.enableGodRays;
		//godRaysPass.enabled = this.config.enableGodRays;
		
		//effectFXAA.uniforms["resolution"].value.x = 1 / width;
		//effectFXAA.uniforms["resolution"].value.y = 1 / height;
		
		//godRaysPass.setIntensity(this.config.godRaysIntensity);
		
		effectHBlur.enabled = this.config.enableBlur;
		effectVBlur.enabled = this.config.enableBlur;
		var blurAmount = (this.config.enableBlur) ? this.config.blurAmount : 0;
		effectHBlur.uniforms[ 'h' ].value = blurAmount / ( width / 2 );
		effectVBlur.uniforms[ 'v' ].value = blurAmount / ( height / 2 );
		
		
		effectBloom.enabled = this.config.enableBloom;
		var bloomStrength = (this.config.enableBloom) ? this.config.bloomStrength : 0;
		effectBloom.copyUniforms["opacity"].value = bloomStrength;
		
		effectBleach.enabled = this.config.enableBleach;
		var bleachAmount = (this.config.enableBleach) ? this.config.bleachAmount : 0;
		effectBleach.uniforms[ "opacity" ].value = bleachAmount;
	
		
		effectSepia.enabled = this.config.enableSepia;
		effectSepia.uniforms[ "amount" ].value = (this.config.enableSepia) ? this.config.sepiaAmount : 0;
		
		//effectFilm.enabled = this.config.enableFilm;
		effectFilm.uniforms.grayscale.value = (this.config.enableFilm) ? this.config.filmGrayscale : false;
		effectFilm.uniforms.nIntensity.value = (this.config.enableFilm) ? this.config.noiseIntensity : 0;
		effectFilm.uniforms.sIntensity.value = (this.config.enableFilm) ? this.config.scanlinesIntensity : 0;
		effectFilm.uniforms.sCount.value = (this.config.enableFilm) ? this.config.scanlinesCount : 0;
	};


};
KMG.DynamicEffectsComposer.prototype = Object.create( THREE.EffectComposer.prototype );
