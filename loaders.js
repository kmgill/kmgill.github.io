
/* File: loaders/OBJLoader.js */
/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.OBJLoader.prototype = {

	constructor: THREE.OBJLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		} );

	},

	parse: function ( text ) {

		// fixes

		text = text.replace( /\ \\\r\n/g, '' ); // rhino adds ' \\r\n' some times.

		var replacement = '/f$1$2$4\n/f$2$3$4'; // quads to tris
		text = text.replace( /f( +\d+)( +\d+)( +\d+)( +\d+)/g, replacement );
		text = text.replace( /f( +\d+\/\d+)( +\d+\/\d+)( +\d+\/\d+)( +\d+\/\d+)/g, replacement );
		text = text.replace( /f( +\d+\/\d+\/\d+)( +\d+\/\d+\/\d+)( +\d+\/\d+\/\d+)( +\d+\/\d+\/\d+)/g, replacement );
		text = text.replace( /f( +\d+\/\/\d+)( +\d+\/\/\d+)( +\d+\/\/\d+)( +\d+\/\/\d+)/g, replacement );

		//

		function vector( x, y, z ) {

			return new THREE.Vector3( x, y, z );

		}

		function uv( u, v ) {

			return new THREE.Vector2( u, v );

		}

		function face3( a, b, c, normals ) {

			return new THREE.Face3( a, b, c, normals );

		}

		var object = new THREE.Object3D();
		var geometry, material, mesh;

		// create mesh if no objects in text

		if ( /^o /gm.test( text ) === false ) {

			geometry = new THREE.Geometry();
			material = new THREE.MeshLambertMaterial();
			mesh = new THREE.Mesh( geometry, material );
			object.add( mesh );

		}

		var vertices = [];
		var verticesCount = 0;
		var normals = [];
		var uvs = [];

		// v float float float

		var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

		// vn float float float

		var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

		// vt float float

		var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

		// f vertex vertex vertex

		var face_pattern1 = /f( +\d+)( +\d+)( +\d+)/;

		// f vertex/uv vertex/uv vertex/uv

		var face_pattern2 = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))/;

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal

		var face_pattern3 = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))/;

		// f vertex//normal vertex//normal vertex//normal

		var face_pattern4 = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))/;

		//

		var lines = text.split( '\n' );

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			var result;

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				continue;

			} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				vertices.push( vector(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				) );

			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push( vector(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				) );

			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				uvs.push( uv(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] )
				) );

			} else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

				// ["f 1 2 3", "1", "2", "3"]

				geometry.vertices.push(
					vertices[ parseInt( result[ 1 ] ) - 1 ],
					vertices[ parseInt( result[ 2 ] ) - 1 ],
					vertices[ parseInt( result[ 3 ] ) - 1 ]
				);

				geometry.faces.push( face3(
					verticesCount ++,
					verticesCount ++,
					verticesCount ++
				) );

			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3"]

				geometry.vertices.push(
					vertices[ parseInt( result[ 2 ] ) - 1 ],
					vertices[ parseInt( result[ 5 ] ) - 1 ],
					vertices[ parseInt( result[ 8 ] ) - 1 ]
				);

				geometry.faces.push( face3(
					verticesCount ++,
					verticesCount ++,
					verticesCount ++
				) );

				geometry.faceVertexUvs[ 0 ].push( [
					uvs[ parseInt( result[ 3 ] ) - 1 ],
					uvs[ parseInt( result[ 6 ] ) - 1 ],
					uvs[ parseInt( result[ 9 ] ) - 1 ]
				] );

			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3"]

				geometry.vertices.push(
					vertices[ parseInt( result[ 2 ] ) - 1 ],
					vertices[ parseInt( result[ 6 ] ) - 1 ],
					vertices[ parseInt( result[ 10 ] ) - 1 ]
				);

				geometry.faces.push( face3(
					verticesCount ++,
					verticesCount ++,
					verticesCount ++,
					[
						normals[ parseInt( result[ 4 ] ) - 1 ],
						normals[ parseInt( result[ 8 ] ) - 1 ],
						normals[ parseInt( result[ 12 ] ) - 1 ]
					]
				) );

				geometry.faceVertexUvs[ 0 ].push( [
					uvs[ parseInt( result[ 3 ] ) - 1 ],
					uvs[ parseInt( result[ 7 ] ) - 1 ],
					uvs[ parseInt( result[ 11 ] ) - 1 ]
				] );

			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3"]

				geometry.vertices.push(
					vertices[ parseInt( result[ 2 ] ) - 1 ],
					vertices[ parseInt( result[ 5 ] ) - 1 ],
					vertices[ parseInt( result[ 8 ] ) - 1 ]
				);

				geometry.faces.push( face3(
					verticesCount ++,
					verticesCount ++,
					verticesCount ++,
					[
						normals[ parseInt( result[ 3 ] ) - 1 ],
						normals[ parseInt( result[ 6 ] ) - 1 ],
						normals[ parseInt( result[ 9 ] ) - 1 ]
					]
				) );

			} else if ( /^o /.test( line ) ) {

				// object

				geometry = new THREE.Geometry();
				material = new THREE.MeshLambertMaterial();

				mesh = new THREE.Mesh( geometry, material );
				mesh.name = line.substring( 2 ).trim();
				object.add( mesh );

				verticesCount = 0;

			} else if ( /^g /.test( line ) ) {

				// group

			} else if ( /^usemtl /.test( line ) ) {

				// material

				material.name = line.substring( 7 ).trim();

			} else if ( /^mtllib /.test( line ) ) {

				// mtl file

			} else if ( /^s /.test( line ) ) {

				// smooth shading

			} else {

				// console.log( "THREE.OBJLoader: Unhandled line " + line );

			}

		}

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			var geometry = object.children[ i ].geometry;

			geometry.computeCentroids();
			geometry.computeFaceNormals();
			geometry.computeBoundingSphere();

		}

		return object;

	}

};

/* File: loaders/MTLLoader.js */
/**
 * Loads a Wavefront .mtl file specifying materials
 *
 * @author angelxuanchang
 */

THREE.MTLLoader = function( baseUrl, options, crossOrigin ) {

	this.baseUrl = baseUrl;
	this.options = options;
	this.crossOrigin = crossOrigin;

};

THREE.MTLLoader.prototype = {

	constructor: THREE.MTLLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader();
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		} );

	},

	/**
	 * Parses loaded MTL file
	 * @param text - Content of MTL file
	 * @return {THREE.MTLLoader.MaterialCreator}
	 */
	parse: function ( text ) {

		var lines = text.split( "\n" );
		var info = {};
		var delimiter_pattern = /\s+/;
		var materialsInfo = {};

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				// Blank line or comment ignore
				continue;

			}

			var pos = line.indexOf( ' ' );

			var key = ( pos >= 0 ) ? line.substring( 0, pos ) : line;
			key = key.toLowerCase();

			var value = ( pos >= 0 ) ? line.substring( pos + 1 ) : "";
			value = value.trim();

			if ( key === "newmtl" ) {

				// New material

				info = { name: value };
				materialsInfo[ value ] = info;

			} else if ( info ) {

				if ( key === "ka" || key === "kd" || key === "ks" ) {

					var ss = value.split( delimiter_pattern, 3 );
					info[ key ] = [ parseFloat( ss[0] ), parseFloat( ss[1] ), parseFloat( ss[2] ) ];

				} else {

					info[ key ] = value;

				}

			}

		}

		var materialCreator = new THREE.MTLLoader.MaterialCreator( this.baseUrl, this.options );
		materialCreator.setMaterials( materialsInfo );
		return materialCreator;

	}

};

/**
 * Create a new THREE-MTLLoader.MaterialCreator
 * @param baseUrl - Url relative to which textures are loaded
 * @param options - Set of options on how to construct the materials
 *                  side: Which side to apply the material
 *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
 *                  wrap: What type of wrapping to apply for textures
 *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
 *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
 *                                Default: false, assumed to be already normalized
 *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
 *                                  Default: false
 *                  invertTransparency: If transparency need to be inverted (inversion is needed if d = 0 is fully opaque)
 *                                      Default: false (d = 1 is fully opaque)
 * @constructor
 */

THREE.MTLLoader.MaterialCreator = function( baseUrl, options ) {

	this.baseUrl = baseUrl;
	this.options = options;
	this.materialsInfo = {};
	this.materials = {};
	this.materialsArray = [];
	this.nameLookup = {};

	this.side = ( this.options && this.options.side )? this.options.side: THREE.FrontSide;
	this.wrap = ( this.options && this.options.wrap )? this.options.wrap: THREE.RepeatWrapping;

};

THREE.MTLLoader.MaterialCreator.prototype = {

	constructor: THREE.MTLLoader.MaterialCreator,

	setMaterials: function( materialsInfo ) {

		this.materialsInfo = this.convert( materialsInfo );
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

	},

	convert: function( materialsInfo ) {

		if ( !this.options ) return materialsInfo;

		var converted = {};

		for ( var mn in materialsInfo ) {

			// Convert materials info into normalized form based on options

			var mat = materialsInfo[ mn ];

			var covmat = {};

			converted[ mn ] = covmat;

			for ( var prop in mat ) {

				var save = true;
				var value = mat[ prop ];
				var lprop = prop.toLowerCase();

				switch ( lprop ) {

					case 'kd':
					case 'ka':
					case 'ks':

						// Diffuse color (color under white light) using RGB values

						if ( this.options && this.options.normalizeRGB ) {

							value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ];

						}

						if ( this.options && this.options.ignoreZeroRGBs ) {

							if ( value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 1 ] === 0 ) {

								// ignore

								save = false;

							}
						}

						break;

					case 'd':

						// According to MTL format (http://paulbourke.net/dataformats/mtl/):
						//   d is dissolve for current material
						//   factor of 1.0 is fully opaque, a factor of 0 is fully dissolved (completely transparent)

						if ( this.options && this.options.invertTransparency ) {

							value = 1 - value;

						}

						break;

					default:

						break;
				}

				if ( save ) {

					covmat[ lprop ] = value;

				}

			}

		}

		return converted;

	},

	preload: function () {

		for ( var mn in this.materialsInfo ) {

			this.create( mn );

		}

	},

	getIndex: function( materialName ) {

		return this.nameLookup[ materialName ];

	},

	getAsArray: function() {

		var index = 0;

		for ( var mn in this.materialsInfo ) {

			this.materialsArray[ index ] = this.create( mn );
			this.nameLookup[ mn ] = index;
			index ++;

		}

		return this.materialsArray;

	},

	create: function ( materialName ) {

		if ( this.materials[ materialName ] === undefined ) {

			this.createMaterial_( materialName );

		}

		return this.materials[ materialName ];

	},

	createMaterial_: function ( materialName ) {

		// Create material

		var mat = this.materialsInfo[ materialName ];
		var params = {

			name: materialName,
			side: this.side

		};

		for ( var prop in mat ) {

			var value = mat[ prop ];

			switch ( prop.toLowerCase() ) {

				// Ns is material specular exponent

				case 'kd':

					// Diffuse color (color under white light) using RGB values

					params[ 'diffuse' ] = new THREE.Color().fromArray( value );

					break;

				case 'ka':

					// Ambient color (color under shadow) using RGB values

					params[ 'ambient' ] = new THREE.Color().fromArray( value );

					break;

				case 'ks':

					// Specular color (color when light is reflected from shiny surface) using RGB values
					params[ 'specular' ] = new THREE.Color().fromArray( value );

					break;

				case 'map_kd':

					// Diffuse texture map

					params[ 'map' ] = this.loadTexture( this.baseUrl + value );
					params[ 'map' ].wrapS = this.wrap;
					params[ 'map' ].wrapT = this.wrap;

					break;

				case 'ns':

					// The specular exponent (defines the focus of the specular highlight)
					// A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

					params['shininess'] = value;

					break;

				case 'd':

					// According to MTL format (http://paulbourke.net/dataformats/mtl/):
					//   d is dissolve for current material
					//   factor of 1.0 is fully opaque, a factor of 0 is fully dissolved (completely transparent)

					if ( value < 1 ) {

						params['transparent'] = true;
						params['opacity'] = value;

					}

					break;

				default:
					break;

			}

		}

		if ( params[ 'diffuse' ] ) {

			if ( !params[ 'ambient' ]) params[ 'ambient' ] = params[ 'diffuse' ];
			params[ 'color' ] = params[ 'diffuse' ];

		}

		this.materials[ materialName ] = new THREE.MeshPhongMaterial( params );
		return this.materials[ materialName ];

	},


	loadTexture: function ( url, mapping, onLoad, onError ) {

		var isCompressed = /\.dds$/i.test( url );

		if ( isCompressed ) {

			var texture = THREE.ImageUtils.loadCompressedTexture( url, mapping, onLoad, onError );

		} else {

			var image = new Image();
			var texture = new THREE.Texture( image, mapping );

			var loader = new THREE.ImageLoader();
			loader.crossOrigin = this.crossOrigin;
			loader.load( url, function ( image ) {

				texture.image = THREE.MTLLoader.ensurePowerOfTwo_( image );
				texture.needsUpdate = true;

				if ( onLoad ) onLoad( texture );

			} );

		}

		return texture;

	}

};

THREE.MTLLoader.ensurePowerOfTwo_ = function ( image ) {

	if ( ! THREE.MTLLoader.isPowerOfTwo_( image.width ) || ! THREE.MTLLoader.isPowerOfTwo_( image.height ) ) {

		var canvas = document.createElement( "canvas" );
		canvas.width = THREE.MTLLoader.nextHighestPowerOfTwo_( image.width );
		canvas.height = THREE.MTLLoader.nextHighestPowerOfTwo_( image.height );

		var ctx = canvas.getContext("2d");
		ctx.drawImage( image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height );
		return canvas;

	}

	return image;

};

THREE.MTLLoader.isPowerOfTwo_ = function ( x ) {

	return ( x & ( x - 1 ) ) === 0;

};

THREE.MTLLoader.nextHighestPowerOfTwo_ = function( x ) {

	--x;

	for ( var i = 1; i < 32; i <<= 1 ) {

		x = x | x >> i;

	}

	return x + 1;

};

THREE.EventDispatcher.prototype.apply( THREE.MTLLoader.prototype );

/* File: loaders/OBJMTLLoader.js */
/**
 * Loads a Wavefront .obj file with materials
 *
 * @author mrdoob / http://mrdoob.com/
 * @author angelxuanchang
 */

THREE.OBJMTLLoader = function () {};

THREE.OBJMTLLoader.prototype = {

	constructor: THREE.OBJMTLLoader,

	load: function ( url, mtlurl, onLoad, onProgress, onError ) {

		var scope = this;

		var mtlLoader = new THREE.MTLLoader( url.substr( 0, url.lastIndexOf( "/" ) + 1 ) );
		mtlLoader.load( mtlurl, function ( materials ) {

			var materialsCreator = materials;
			materialsCreator.preload();

			var loader = new THREE.XHRLoader( scope.manager );
			loader.setCrossOrigin( this.crossOrigin );
			loader.load( url, function ( text ) {

				var object = scope.parse( text );

				object.traverse( function ( object ) {

					if ( object instanceof THREE.Mesh ) {

						if ( object.material.name ) {

							var material = materialsCreator.create( object.material.name );

							if ( material ) object.material = material;

						}

					}

				} );

				onLoad( object );

			} );

		} );

	},

	/**
	 * Parses loaded .obj file
	 * @param data - content of .obj file
	 * @param mtllibCallback - callback to handle mtllib declaration (optional)
	 * @return {THREE.Object3D} - Object3D (with default material)
	 */

	parse: function ( data, mtllibCallback ) {

		// fixes

		data = data.replace( /\ \\\r\n/g, '' ); // rhino adds ' \\r\n' some times.

		var replacement = '/f$1$2$4\n/f$2$3$4'; // quads to tris
		data = data.replace( /f( +\d+)( +\d+)( +\d+)( +\d+)/g, replacement );
		data = data.replace( /f( +\d+\/\d+)( +\d+\/\d+)( +\d+\/\d+)( +\d+\/\d+)/g, replacement );
		data = data.replace( /f( +\d+\/\d+\/\d+)( +\d+\/\d+\/\d+)( +\d+\/\d+\/\d+)( +\d+\/\d+\/\d+)/g, replacement );
		data = data.replace( /f( +\d+\/\/\d+)( +\d+\/\/\d+)( +\d+\/\/\d+)( +\d+\/\/\d+)/g, replacement );

		//

		function vector( x, y, z ) {

			return new THREE.Vector3( x, y, z );

		}

		function uv( u, v ) {

			return new THREE.Vector2( u, v );

		}

		function face3( a, b, c, normals ) {

			return new THREE.Face3( a, b, c, normals );

		}

		function meshN( meshName, materialName ) {

			if ( geometry.vertices.length > 0 ) {

				geometry.mergeVertices();
				geometry.computeCentroids();
				geometry.computeFaceNormals();
				geometry.computeBoundingSphere();

				object.add( mesh );

				geometry = new THREE.Geometry();
				mesh = new THREE.Mesh( geometry, material );

				verticesCount = 0;

			}

			if ( meshName !== undefined ) mesh.name = meshName;
			if ( materialName !== undefined ) {

				material = new THREE.MeshLambertMaterial();
				material.name = materialName;

				mesh.material = material;

			}

		}

		var group = new THREE.Object3D();
		var object = group;

		var geometry = new THREE.Geometry();
		var material = new THREE.MeshLambertMaterial();
		var mesh = new THREE.Mesh( geometry, material );

		var vertices = [];
		var verticesCount = 0;
		var normals = [];
		var uvs = [];

		// v float float float

		var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

		// vn float float float

		var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

		// vt float float

		var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/

		// f vertex vertex vertex

		var face_pattern1 = /f( +\d+)( +\d+)( +\d+)/

		// f vertex/uv vertex/uv vertex/uv

		var face_pattern2 = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))/;

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal

		var face_pattern3 = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))/;

		// f vertex//normal vertex//normal vertex//normal

		var face_pattern4 = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))/;

		//

		var lines = data.split( "\n" );

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			var result;

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				continue;

			} else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				vertices.push( vector(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				) );

			} else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push( vector(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] ),
					parseFloat( result[ 3 ] )
				) );

			} else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				uvs.push( uv(
					parseFloat( result[ 1 ] ),
					parseFloat( result[ 2 ] )
				) );

			} else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

				// ["f 1 2 3", "1", "2", "3"]

				geometry.vertices.push(
					vertices[ parseInt( result[ 1 ] ) - 1 ],
					vertices[ parseInt( result[ 2 ] ) - 1 ],
					vertices[ parseInt( result[ 3 ] ) - 1 ]
				);

				geometry.faces.push( face3(
					verticesCount ++,
					verticesCount ++,
					verticesCount ++
				) );

			} else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3"]

				geometry.vertices.push(
					vertices[ parseInt( result[ 2 ] ) - 1 ],
					vertices[ parseInt( result[ 5 ] ) - 1 ],
					vertices[ parseInt( result[ 8 ] ) - 1 ]
				);

				geometry.faces.push( face3(
					verticesCount ++,
					verticesCount ++,
					verticesCount ++
				) );

				geometry.faceVertexUvs[ 0 ].push( [
					uvs[ parseInt( result[ 3 ] ) - 1 ],
					uvs[ parseInt( result[ 6 ] ) - 1 ],
					uvs[ parseInt( result[ 9 ] ) - 1 ]
				] );

			} else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3"]

				geometry.vertices.push(
					vertices[ parseInt( result[ 2 ] ) - 1 ],
					vertices[ parseInt( result[ 6 ] ) - 1 ],
					vertices[ parseInt( result[ 10 ] ) - 1 ]
				);

				geometry.faces.push( face3(
					verticesCount ++,
					verticesCount ++,
					verticesCount ++,
					[
						normals[ parseInt( result[ 4 ] ) - 1 ],
						normals[ parseInt( result[ 8 ] ) - 1 ],
						normals[ parseInt( result[ 12 ] ) - 1 ]
					]
				) );

				geometry.faceVertexUvs[ 0 ].push( [
					uvs[ parseInt( result[ 3 ] ) - 1 ],
					uvs[ parseInt( result[ 7 ] ) - 1 ],
					uvs[ parseInt( result[ 11 ] ) - 1 ]
				] );

			} else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3"]

				geometry.vertices.push(
					vertices[ parseInt( result[ 2 ] ) - 1 ],
					vertices[ parseInt( result[ 5 ] ) - 1 ],
					vertices[ parseInt( result[ 8 ] ) - 1 ]
				);

				geometry.faces.push( face3(
					verticesCount ++,
					verticesCount ++,
					verticesCount ++,
					[
						normals[ parseInt( result[ 3 ] ) - 1 ],
						normals[ parseInt( result[ 6 ] ) - 1 ],
						normals[ parseInt( result[ 9 ] ) - 1 ]
					]
				) );

			} else if ( /^o /.test( line ) ) {

				// object

				object = new THREE.Object3D();
				object.name = line.substring( 2 ).trim();
				group.add( object );

			} else if ( /^g /.test( line ) ) {

				// group

				meshN( line.substring( 2 ).trim(), undefined );

			} else if ( /^usemtl /.test( line ) ) {

				// material

				meshN( undefined, line.substring( 7 ).trim() );

			} else if ( /^mtllib /.test( line ) ) {

				// mtl file

				if ( mtllibCallback ) {

					var mtlfile = line.substring( 7 );
					mtlfile = mtlfile.trim();
					mtllibCallback( mtlfile );

				}

			} else if ( /^s /.test( line ) ) {

				// Smooth shading

			} else {

				console.log( "THREE.OBJMTLLoader: Unhandled line " + line );

			}

		}

		//Add last object
		meshN(undefined, undefined);

		return group;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.OBJMTLLoader.prototype );
