KMG.BaseObject = function ( ) {
	
	THREE.Object3D.call( this );
	var scope = this;
	
	this.setVisibility = function(visible) {
		this.traverse(function(obj) {
			obj.visible = visible;
		});
	};
	
	this.setShadowInteraction = function(enable) {
		this.traverse(function(obj) {
			obj.castShadow = enable;
			obj.receiveShadow = enable;
		});
	};
	
};
KMG.BaseObject.prototype = Object.create( THREE.Object3D.prototype );



/*
KMG.TemplateObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config;
	this.context = context;
	var scope = this;
	
	
	// Create Stuff
	
	this.uniforms = uniforms;
	this.mesh = mesh;
	this.material = material;
	this.geometry = geometry;
	
	this.add(mesh);
	
	this.update = function()
	{
		if (!this.context.configChanged) 
			return;
			
	};
};
KMG.TemplateObject.prototype = Object.create( KMG.BaseObject.prototype );
*/

