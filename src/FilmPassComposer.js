
KMG.DefaultFilmPassOptions = {
	noiseIntensity : 0.35,
	scanlinesIntensity : 0.75,
	scanlinesCount : 2048,
	grayscale : false
};


KMG.FilmPassComposer = function(context, scene, camera, renderer, config) {

	THREE.EffectComposer.call( this, renderer );
	this.config = config = KMG.Util.extend((config) ? config : {}, KMG.DefaultFilmPassOptions);
	var scope = this;
	
	var renderPass = new THREE.RenderPass( scene, camera );
	var effectFilm = new THREE.FilmPass( config.noiseIntensity, config.scanlinesIntensity, config.scanlinesCount, config.grayscale );
	effectFilm.renderToScreen = true;

	this.addPass( renderPass );
	this.addPass( effectFilm );
	
	
	this.update = function() {
	
	
	};
	

};

KMG.FilmPassComposer.prototype = Object.create( THREE.EffectComposer.prototype );