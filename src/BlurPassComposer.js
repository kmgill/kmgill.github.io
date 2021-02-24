
KMG.DefaultBlurPassOptions = {
	hBlurAmount : 0.5,
	vBlurAmount : 0.5
};

KMG.BlurPassComposer = function(context, scene, camera, renderer, config) {

	THREE.EffectComposer.call( this, renderer );
	this.config = config = KMG.Util.extend((config) ? config : {}, KMG.DefaultBlurPassOptions);
	var scope = this;
	
	var renderPass = new THREE.RenderPass( scene, camera );
	
	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;
	
	var effectHBlur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	var effectVBlur = new THREE.ShaderPass( THREE.VerticalBlurShader );
	effectHBlur.uniforms[ 'h' ].value = config.hBlurAmount / ( width / 2 );
	effectVBlur.uniforms[ 'v' ].value = config.vBlurAmount / ( height / 2 );
	effectVBlur.renderToScreen = true;
	
	this.addPass( renderPass );
	this.addPass( effectHBlur );
	this.addPass( effectVBlur );
	
	this.update = function() {
		
		effectHBlur.uniforms[ 'h' ].value = config.hBlurAmount / ( width / 2 );
		effectVBlur.uniforms[ 'v' ].value = config.vBlurAmount / ( height / 2 );
	
	};
	

};

KMG.BlurPassComposer.prototype = Object.create( THREE.EffectComposer.prototype );