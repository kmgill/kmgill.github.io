
KMG.DefaultConfig = {
	version : 2.0,
	initWithShadows : true,
	shadows : false,
	shadowDarkness : 0.5,
	radius : 200,
	cloudsRadius : 200.5,
	textureResolution : "2048x1024",
	enableFps : false,
	postprocessingEnabled : true,
	
	useScript : true,
	
	// Light
	lightingType : "Directional", // or "Point"
	sunlightDirection : 60.0,
	realtimeSunlight : false,
	sunlightDate : (new Date()).getTime(),
	localStarDistance : 1.0,
	displayLocalStar : true,
	localStarTexture : KMG.starFlares[0].name,
	localStarColor : [ 255, 255, 255 ],
	starColorAffectsPlanetLighting : true,
	lensFlareEnabled : false,
	
	// Surface
	texture : KMG.textures[1].name,
	surfaceDetail : 1.0,
	elevationScale : 0,
	shininess : 60,
	diffuseIntensity : 170,
	specularIntensity : 4,
	ambientIntensity : 0,
	emissiveIntensity : 0,
	enableCityLights : true,
	cityLightsIntensity : 1.0,
	flattening : 0.0033528,
	axialTilt : 0.0,
	surfaceColorMode : "Normal",
	surfaceHue : 0.5,
	surfaceSaturation : 0.0,
	surfaceLightness : 0.75,
	surfaceWrapRGB : 0.031,
	surfaceRotation : 0.0,
	scaleSurface : 1.0, 
	
	moonTemplate : {
		id : "",
		displayMoon : true,
		moonTexture : KMG.textures[12].name,
		moonColorMode : "Normal",
		moonHue : 0.5,
		moonSaturation : 0.0,
		moonLightness : 0.75,
		moonSurfaceDetail : 0.2,
		moonElevationScale : 0,
		moonShininess : 60,
		moonDiffuseIntensity : 90,
		moonSpecularIntensity : 0,
		moonAmbientIntensity : 8,
		moonEmissiveIntensity : 0,
		moonDistance : 1.0,
		moonScale : 1.0,
		moonAngle : 45,
		moonRotation : 160.0,
		shadows : false
	},
	moons : [],
	

	// Clouds
	cloudsTexture : KMG.clouds[1].name,
	displayClouds : true,
	cloudsHue : 0.5,
	cloudsSaturation : 0.0,
	cloudsLightness : 0.75,
	cloudsDetail : 0.6,
	cloudsElevation : 0.25,
	cloudsThickness : 0,
	cloudsOpacity : 1.0,
	cloudsCastShadows : true,
	cloudsShadowLevel : 0.8,
	cloudsDiffuseIntensity : 170,
	cloudsSpecularIntensity : 4,
	cloudsAmbientIntensity : 60,
	
	// Atmosphere
	displayAtmosphere : true,
	atmosphereColor : [ 0.40784 * 255, 0.541 * 255, 0.69 * 255 ],
	atmosphereScale : 1.0,
	atmosphereIntensity : 0.7,
	atmosphereRadius : 202.0, 

	// Ring
	displayRing : false,
	ringTexture : KMG.rings[0].name,
	ringHue : 0.5,
	ringSaturation : 0.0,
	ringLightness : 0.75,
	ringInnerRadius : 260.0,
	ringOutterRadius : 400.0,
	ringAngle : 0.0,
	showShadows : true,
	ringOpacity : 1.0,
	
	
	// Background
	backgroundType : 'stars',
	backgroundImage : 'Starfield',
	backgroundImageType : 'flat',
	backgroundImageFitType : 'stretch',
	starQuantity : 6.5, // 0 - 10
	
	// Effects
	enableGodRays : false,
	godRaysIntensity : 0.75,
	enableBlur : false,
	blurAmount : 0.5,
	enableBloom : false,
	bloomStrength : 0.5,
	enableBleach : false,
	bleachAmount : 0.95,
	enableFilm : false,
	noiseIntensity : 0.35,
	scanlinesIntensity : 0.75,
	scanlinesCount : 2048,
	filmGrayscale : false,
	enableSepia : false,
	sepiaAmount : 0.9,
	
	camera : {
		positionZ : 700,
		fieldOfView : 45,
		near : 0.01,
		far : 10000000,
		
		useSecondaryParameters : false,
		fieldOfViewSecondary : 45,
		nearSecondary : 0.01,
		farSecondary : 10000000
	},
	controls : {
		rotateSpeed : 0.5
	}
};
