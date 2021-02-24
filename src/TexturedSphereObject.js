
KMG.MaterialPhong = 1;
KMG.MaterialLambert = 2;

KMG.DefaultTexturedSphereOptions = {
	texture : "Earth - Blue Marble",
	scale : 1,
	radius : 200,
	flattening : 0,
	ambient : 0x888888,
	color : 0xDDDDDD,
	emissive : 0x000000,
	material : KMG.MaterialLambert,
	specular : 0x444444,
	shadows : true,
	slices : 32,
	shading : true,
	transparent : false

};

/** A simpler sphere for small planets or moons
 *
 */
KMG.TexturedSphereObject = function(context, config) {
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultTexturedSphereOptions);
	this.context = context;
	var scope = this;
	
	var geometry = new THREE.EllipsoidGeometry( this.config.radius, this.config.flattening, this.config.slices, this.config.slices );
	
	var texDefinition = KMG.TextureMap.getTextureDefinitionByName(this.config.texture);
	if (!texDefinition) {
		texDefinition = KMG.TextureMap.getCloudDefinitionByName(this.config.texture);
	}
	
	var tDiffuse = (texDefinition.texture) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
	if (config.transparent) {
		tDiffuse.format = THREE.RGBAFormat;
	}
	
	var material;
	
	var shading = (config.shading) ? THREE.SmoothShading : THREE.NoShading;
	
	if (this.config.material == KMG.MaterialLambert) {
		material = new THREE.MeshLambertMaterial({
									ambient		: new THREE.Color(this.config.ambient),
									color		: new THREE.Color(this.config.color),
									emissive	: new THREE.Color(this.config.emissive),
									shading		: shading,
									map			: tDiffuse,
									fog			: this.config.fog,
									transparent : this.config.transparent
								});
	} else if (this.config.material == KMG.MaterialPhong) {
		var tSpecular = (texDefinition.specularMap) ? KMG.TextureMap.loadTexture(texDefinition.specularMap) : null;
		material = new THREE.MeshPhongMaterial({
									ambient		: new THREE.Color(this.config.ambient),
									color		: new THREE.Color(this.config.color),
									emissive	: new THREE.Color(this.config.emissive),
									specular	: new THREE.Color(this.config.specular),
									shading		: shading,
									map			: tDiffuse,
									specularMap	: tSpecular,
									fog			: this.config.fog,
									transparent : this.config.transparent
								});
	} 
								
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position = new THREE.Vector3( 0, 0, 0 );
	
	mesh.castShadow = config.shadows;
	mesh.receiveShadow = config.shadows;
	
	
	this.add(mesh);
		
	
	this.sphereMesh = mesh;
	
	this.update = function()
	{
		if (!this.context.configChanged)
			return;
		
		this.scale.set(this.config.scale, this.config.scale, this.config.scale);
		mesh.castShadow = scope.config.shadows;
		mesh.receiveShadow = scope.config.shadows;
	};
};
KMG.TexturedSphereObject.prototype = Object.create( KMG.BaseObject.prototype );
	
	
