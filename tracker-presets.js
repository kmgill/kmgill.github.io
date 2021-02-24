KMG.Tracker = {};
KMG.Tracker.Presets = [
	{
		name : "venus-transit-2012",

		config : {
			focusPoint : "Sun",
			lookingFrom : "Earth",
			startDate : 1338956820000,
			animationSpeedMultiple : 0.005,
			fieldOfView : 1.0,
			starNamesVisible : false,
			allOrbits : false,
			majorPlanetOrbits : false,
			minorPlanetOrbits : false,
			moonOrbits : false,
			focusOrbits : false,
			viewFromType : "Topocentric",
			viewFromLatitude : 42.346389,
			viewFromLongitude : -71.0975,
			loadedObjects : []
		}

	},
	{
		name : "earth-from-moon",

		config : {
			focusPoint : "Earth",
			lookingFrom : "Moon",
			animationSpeedMultiple : 0.005,
			fieldOfView : 5.0,
			starNamesVisible : false,
			allOrbits : false,
			majorPlanetOrbits : false,
			minorPlanetOrbits : false,
			moonOrbits : false,
			focusOrbits : false,
			viewFromType : "Topocentric",
			viewFromLatitude : 0.67408,
			viewFromLongitude : 23.47297,
			loadedObjects : []
		}

	},
	{
		name : "jupiter-from-earth",

		config : {
			focusPoint : "Jupiter",
			lookingFrom : "Earth",
			animationSpeedMultiple : 0.005,
			fieldOfView : 0.2,
			starNamesVisible : false,
			allOrbits : false,
			majorPlanetOrbits : false,
			minorPlanetOrbits : false,
			moonOrbits : false,
			focusOrbits : false,
			viewFromType : "Topocentric",
			viewFromLatitude : 0.67408,
			viewFromLongitude : 23.47297,
			orientUpToEcliptic : true,
			loadedObjects : []
		}

	},
	{
		name : "iss",
		config : {
			focusPoint : "Earth",
			lookingFrom : "Free",
			animationSpeedMultiple : 0.005,
			fieldOfView : 45,
			starNamesVisible : false,
			allOrbits : false,
			majorPlanetOrbits : true,
			minorPlanetOrbits : false,
			moonOrbits : false,
			focusOrbits : true,
			viewFromType : "Topocentric",
			viewFromLatitude : 0.67408,
			viewFromLongitude : 23.47297,
			loadedObjects : [],
			satellites : ["25544"],
			scale : 5500.085178239839
		}
		
	},
	{
		name : "triple-shadow-transit",

		config : {
			focusPoint : "Jupiter",
			lookingFrom : "Earth",
			animationSpeedMultiple : 0.005,
			startDate : 1401840000000,
			fieldOfView : 0.025,
			starNamesVisible : false,
			allOrbits : false,
			majorPlanetOrbits : false,
			minorPlanetOrbits : false,
			moonOrbits : false,
			focusOrbits : false,
			viewFromType : "Topocentric",
			viewFromLatitude : 0.67408,
			viewFromLongitude : 23.47297,
			loadedObjects : []
		}

	}

];


KMG.Tracker.PresetTrackedObjectTrackerTemplate = {
	name : "--",

	config : {
		focusPoint : "--",
		lookingFrom : "Earth",
		animationSpeedMultiple : 0.005,
		fieldOfView : 40,
		starNamesVisible : true,
		allOrbits : false,
		majorPlanetOrbits : false,
		minorPlanetOrbits : false,
		moonOrbits : false,
		focusOrbits : false,
		viewFromType : "Geocentric",
		loadedObjects : []
	}

};

KMG.Tracker.PresetPlanetTrackerTemplate = {
	name : "--",

	config : {
		focusPoint : "--",
		lookingFrom : "Earth",
		animationSpeedMultiple : 0.005,
		fieldOfView : 22,
		starNamesVisible : true,
		allOrbits : false,
		majorPlanetOrbits : false,
		minorPlanetOrbits : false,
		moonOrbits : false,
		focusOrbits : false,
		viewFromType : "Topocentric",
		viewFromLatitude : 42.346389,
		viewFromLongitude : -71.0975,
		loadedObjects : []
	}

};

KMG.Tracker.createTracker = function(name, id, preload, doPreload, template) {
	
	if (!id) {
		id = name.toLowerCase();
	}

	var preset = KMG.Util.extend({}, template);
	preset.name = id;
	preset.config.focusPoint = name;
	
	
	if (doPreload) {
		if (!preload) {
			preload = id;
		}
		
		if (preload instanceof Array) {
			preset.config.loadedObjects = preload;
		} else {
			preset.config.loadedObjects.push(preload);
		}
	}
	KMG.Tracker.Presets.push(preset);
	
	
};

KMG.Tracker.createTrackedObjectTracker = function(name, id, preload) {
	KMG.Tracker.createTracker(name, id, preload, true, KMG.Tracker.PresetTrackedObjectTrackerTemplate);
};

KMG.Tracker.createPlanetTracker = function(name, id) {
	KMG.Tracker.createTracker(name, id, null, false, KMG.Tracker.PresetPlanetTrackerTemplate);
};

KMG.Tracker.createPlanetTracker("Mercury");
KMG.Tracker.createPlanetTracker("Venus");
KMG.Tracker.createPlanetTracker("Moon");
KMG.Tracker.createPlanetTracker("Mars");
KMG.Tracker.createPlanetTracker("Ceres");
KMG.Tracker.createPlanetTracker("Vesta");
KMG.Tracker.createPlanetTracker("Jupiter");
KMG.Tracker.createPlanetTracker("Saturn");
KMG.Tracker.createPlanetTracker("Uranus");
KMG.Tracker.createPlanetTracker("Neptune");
KMG.Tracker.createPlanetTracker("Pluto");
KMG.Tracker.createPlanetTracker("Sedna");
KMG.Tracker.createPlanetTracker("Makemake");
KMG.Tracker.createPlanetTracker("Haumea");
KMG.Tracker.createPlanetTracker("Eris");


KMG.Tracker.getTrackerName = function() {
	
	var url = document.location.href;
	var base = url.split(/[#?]/)[0];
	var val = base.match(/[\w\-]+\/*$/)[0];
	val = val.replace(/\/+/, "");
	return val;
	
};

KMG.Tracker.getPresetConfigForName = function(name) {
	
	for (var i = 0; i < KMG.Tracker.Presets.length; i++) {
		if (KMG.Tracker.Presets[i].name == name) {
			return KMG.Tracker.Presets[i].config;
		}
	}
	
	return null;
};

KMG.Tracker.isTrackerPresetRequested = function() {
	var presetName = KMG.Tracker.getTrackerName();

	if (presetName == null || presetName == "html" || presetName == "com" || presetName == "us" || presetName == "8080") {
		return false;
	} else {
		return true;
	}

};

KMG.Tracker.applyPresetConfig = function(modelOptions) {
	var presetName = KMG.Tracker.getTrackerName();
	if (presetName == null) {
		return;
	}
	
	var presetConfig = KMG.Tracker.getPresetConfigForName(presetName);
	if (!presetConfig) {
		return;
	}
	
	for (var entry in presetConfig) {
		modelOptions[entry] = presetConfig[entry];
	}
	
	return modelOptions;
};

KMG.Tracker.applyTracker = function(modelOptions, viewConfig, loadCallback) {
	
	KMG.Tracker.applyPresetConfig(modelOptions);
	KMG.Tracker.applyPresetConfig(viewConfig);
	loadCallback();

};


KMG.Tracker.onTracker = function(modelOptions, viewConfig, loadCallback, presetNotFoundCallback) {
	var presetName = KMG.Tracker.getTrackerName();
	
	if (presetName == null) {
		presetNotFoundCallback("Not Specified");
	}
	
	var presetConfig = KMG.Tracker.getPresetConfigForName(presetName);
	if (presetConfig != null) {
		
		// Preset already exists (is hard-coded above)
		KMG.Tracker.applyTracker(modelOptions, viewConfig, loadCallback);
		
	} else {
		
		// Otherwise, load the tracked objects list and see if we can dynamically create a preset
		console.info("Loading object " + presetName); 
		$.ajax({
			//url: "/data/horizons/tracked_objects.json",
			url : "/api/data/" + presetName,
			dataType: "json",
			error: function( jqXHR, textStatus, errorThrown ) {
				console.warn("Error: " + errorThrown);
			
			},
			success: function(data, textStatus, jqxhr) {
				
			}
		}).done(function(data) {
	
			KMG.Tracker.createTrackedObjectTracker(data.name, data._id);
			KMG.Tracker.applyTracker(modelOptions, viewConfig, loadCallback);
			return;

			// If we are here, then no preset can be loaded. Pass the buck back to the UI to handle gracefully
			if (presetNotFoundCallback) {
				presetNotFoundCallback(presetName);
			}
		});
		
		
		
	}
	
};
