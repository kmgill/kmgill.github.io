KMG.DefaultStarMapSphereOptions = {
	texture : "Yale Bright Star Map"

};


KMG.StarMapSphereObject = function ( context, config ) {
	
	KMG.BaseObject.call( this );
	this.config = config = KMG.Util.extend(config, KMG.DefaultStarMapSphereOptions);
	this.context = context;
	var scope = this;

	
	
	var texDefinition = KMG.TextureMap.getBackgroundDefinitionByName(config.texture);
	var tDiffuse = (texDefinition.texture != null) ? KMG.TextureMap.loadTexture(texDefinition.texture) : null;
	
	var shader = THREE.StarMapShader;
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	
	
	uniforms[ "tStarMap" ].value = tDiffuse;
	
	var geometry = new THREE.SphereGeometry( 10000000, 96, 96 );
	geometry.computeTangents();
	
	
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader,
		transparent : true,
		side : THREE.BackSide,
		blending : THREE.AdditiveBlending,
		depthWrite: false, depthTest: true,
		lights: true
	});
	
	var mesh = new THREE.Mesh(geometry, material);

	mesh.updateMatrix();
	
	this.add(mesh);
	
	
	
	this.update = function()
	{
	
	};
};
KMG.StarMapSphereObject.prototype = Object.create( KMG.BaseObject.prototype );




THREE.StarMapShader = {

	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib[ "shadowmap" ],
		THREE.UniformsLib[ "lights" ],

		{
			"tStarMap"	   : { type: "t", value: null },
					
			"minimumRedLevel": { type: "f", value: 0.15 },		
			"uOffset" : { type: "v2", value: new THREE.Vector2( 0.001, 0.001 ) },
			"uRepeat" : { type: "v2", value: new THREE.Vector2( 0.998, 0.998 ) }
		}]),

	vertexShader: [
		
		"varying vec2 vUv;",
		"uniform vec2 uOffset;",
		"uniform vec2 uRepeat;",
		
		'void main() {',

		'	vUv = uv * uRepeat + uOffset;',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); ',
		'}'
	].join("\n"),

	fragmentShader: [
		
		"uniform sampler2D tStarMap;",
		"varying vec2 vUv;",
		"uniform float minimumRedLevel;",
		
		'void main() {',
		'	vec4 texelColor = texture2D( tStarMap, vUv );',
		'	if (texelColor.x >= minimumRedLevel) {',
		'	gl_FragColor = texelColor;', 
		'	}',

		'}'
	].join("\n")

};

