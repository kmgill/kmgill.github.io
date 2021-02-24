
THREE.HaloShader = {

	uniforms: THREE.UniformsUtils.merge( [
		THREE.UniformsLib[ "shadowmap" ],
		THREE.UniformsLib[ "lights" ],

		{

		"uColor": { type: "v4", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
		"viewVector": { type: "v3", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
		"uTop":  { type: "f", value: 0.94 },//0.94 },
		"uPower":  { type: "f", value: 13.0 },//13.0 },
		"usingDirectionalLighting": { type: "i", value: 1 }
		}]),

	vertexShader: [
		'uniform vec3 viewVector;',
		"attribute vec4 tangent;",
		'varying vec3 vNormal; ',
		'varying float intensity;',
		'uniform float uTop;',
		'uniform float uPower;',
		
		'void main() {',
		'	vNormal = normalize( normalMatrix * normal );',
		'	vec3 vNormel = normalize( normalMatrix * viewVector );',
		'	intensity = pow( uTop - dot(vNormal, vNormel), uPower );',
		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); ',
		'}'
	].join("\n"),

	fragmentShader: [
		'uniform vec4 uColor;',
		'varying vec3 vNormal; ',
		'varying float intensity;',
		'uniform bool usingDirectionalLighting;',
		
		"#if MAX_DIR_LIGHTS > 0",

			"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
			"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",

		"#endif",
		
		'void main() {',

		"	vec3 dirDiffuse = vec3( 0.0 );",
		"	vec3 dirSpecular = vec3( 0.0 );",
		
		"#if MAX_DIR_LIGHTS > 0",
		"	if (usingDirectionalLighting) {",
				"for( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",
					"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
					"vec3 dirVector = normalize( lDirection.xyz );",
					
					"float directionalLightWeightingFull = max( dot( vNormal, dirVector ), 0.0);",
					"float directionalLightWeightingHalf = max(0.5 * dot( vNormal, dirVector ) + 0.5, 0.0);",
					"vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ) , vec3(0.4) );",

					"dirDiffuse += dirDiffuseWeight;",
				"}",

		"	} else {",
			"	dirDiffuse = vec3( 1.0 );",
		"	}",
		"#else",
			"	dirDiffuse = vec3( 1.0 );",
		"#endif",
		//"	if (gl_FrontFacing) {",
		//"		gl_FragColor = vec4(0.0);",
		//"	} else {",
		'		gl_FragColor = uColor * intensity * intensity *  vec4(dirDiffuse, 1.0);', 
		//"	}",
		'}'
	].join("\n")

};



