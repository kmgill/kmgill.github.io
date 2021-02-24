
KMG.DefaultDotPlotConfig = {
	opacity : 1.0,
	color : 0xFFFFFF,
	texture : '/img/star_particle.png',
	size : 4

};

KMG.DotPlotObject = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultDotPlotConfig);
	this.context = context;
	var scope = this;
	
	var particleTexture = KMG.TextureMap.loadTexture(config.texture);
	particleTexture.wrapS = particleTexture.wrapT = THREE.ClampToEdgeWrapping;
	particleTexture.format = THREE.RGBAFormat;
	
	
	var  particles, geometry, material, parameters, i, h, color;
		
	geometry = new THREE.Geometry();

	material = new THREE.ParticleBasicMaterial( { map: particleTexture
													, color: config.color
													, size: config.size
													, fog : false
													, sizeAttenuation : false
													, transparent : true
													, opacity : config.opacity
													, blending : THREE.AdditiveBlending
													, depthWrite: false
													, depthTest: true
													} );
	var vertex = new THREE.Vector3(0, 0, 0);
	geometry.vertices.push( vertex );
	
	particles = new THREE.ParticleSystem( geometry, material );
	
	this.material = material;
	
	this.add( particles );

	this.update = function()
	{
		if (!this.context.configChanged)
			return;
			
		//material.color = new THREE.Color(config.color);
		
		this.traverse(function(obj) {
			obj.visible = (config.opacity != 0);
		});
	};
};
KMG.DotPlotObject.prototype = Object.create( KMG.BaseObject.prototype );
