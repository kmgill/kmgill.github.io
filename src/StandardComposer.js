
KMG.StraightThroughRenderPass = function(scene, camera) {

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;
	
	this.render = function( renderer, writeBuffer, readBuffer, delta ) {
		renderer.render( scene, camera );
	}
};

KMG.StandardComposer = function(context, scene, camera, renderer) {

	THREE.EffectComposer.call( this, renderer );
	
	var scope = this;
	
	var renderPass = new KMG.StraightThroughRenderPass( scene, camera );
	this.addPass( renderPass );

	
	this.update = function() {
	
	
	};


};
KMG.StandardComposer.prototype = Object.create( THREE.EffectComposer.prototype );
