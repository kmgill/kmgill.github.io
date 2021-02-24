
KMG.TextureMap = {

	map : {},
	textureResolution : "2048x1024",
	texturesLoading : 0,
	sceneReadyCallback : null,
	resourceLoadingStart : null,
	resourceLoadingFinish : null,
	renderCallback : null,
	
	onResourceLoaded : function()
	{
		KMG.TextureMap.texturesLoading--;
		if (KMG.TextureMap.sceneReadyCallback && KMG.TextureMap.texturesLoading === 0) {
			KMG.TextureMap.sceneReadyCallback();
		}
		
		if (KMG.TextureMap.resourceLoadingFinish) {
			KMG.TextureMap.resourceLoadingFinish(true, KMG.TextureMap.texturesLoading);
		}
	},
	
	setupEncodedTexture : function(dat) {
		var img = new Image();
		var t = new THREE.Texture(img);
		t.wrapS = THREE.RepeatWrapping;

		img.onload = function() {
			t.needsUpdate = true;
			KMG.TextureMap.onResourceLoaded();
			if (KMG.TextureMap.renderCallback !== null) {
				KMG.TextureMap.renderCallback();
			}
		};
		img.src = dat;
		return t;
	},

	
	loadTexture : function(url, onload, noCache)
	{

		if (!url || url.length === 0) {
			return null;
		}
		
		if (!onload) {
			onload = KMG.TextureMap.onResourceLoaded;
		} else {
			var origOnload = onload;
			onload = function() {
				origOnload();
				KMG.TextureMap.onResourceLoaded();
			};
		}
		
		url = url.replace("#resolution#", KMG.TextureMap.textureResolution);
		
		if (KMG.TextureMap.map[url] !== undefined && !noCache) {
			return KMG.TextureMap.map[url];
		}
		
		if (KMG.TextureMap.resourceLoadingStart) {
			KMG.TextureMap.resourceLoadingStart(url);
		}
		
		KMG.TextureMap.texturesLoading++;
		
		var tex = null;
		if (/^data:/i.test(url)) {
			tex = KMG.TextureMap.setupEncodedTexture(url);
			onload();
		} else {
			tex = THREE.ImageUtils.loadTexture( url, {}, onload, onload );
		}
		
		tex.repeat.set( 0.998, 0.998 );
		tex.offset.set( 0.001, 0.001 )
		tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
		tex.format = THREE.RGBFormat;
		//KMG.TextureMap.map[url].anisotropy = 4;
		
		if (!noCache) {
			KMG.TextureMap.map[url] = tex;
		} 
		
		return tex;
	},
	
	getDefinitionByName : function(list, name) 
	{
		for (var i = 0; i < list.length; i++) {
			if (list[i].name == name) {
				return list[i];
			}
		}
		return null;
	},
	
	getCloudDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.clouds, name);
	},
	
	getRingDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.rings, name);
	},
	
	getTextureDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.textures, name);
	},
	
	getBackgroundDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.backgrounds, name);
	},
	
	getFlareDefinitionByName : function( name )
	{
		return KMG.TextureMap.getDefinitionByName(KMG.starFlares, name);
	}

};
