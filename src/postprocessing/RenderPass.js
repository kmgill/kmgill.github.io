/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	__render: function (scene, renderer, writeBuffer, readBuffer, delta, clear ) {
		scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}
		

		renderer.render( scene, this.camera, readBuffer, clear );
		
		
		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		scene.overrideMaterial = null;
		
	},


	render: function ( renderer, writeBuffer, readBuffer, delta ) {
		

		if (this.scene instanceof Array) {
			for (var i = 0; i < this.scene.length; i++) {
				this.__render(this.scene[i], renderer, writeBuffer, readBuffer, delta, (this.clear && i == 0));
			}
		} else {
			this.__render(this.scene, renderer, writeBuffer, readBuffer, delta, this.clear);
		}

	}

};
