
var AppEnv = {

	config : {
		devMode : false,
		embedded : false,
		disablePlanet : false,
		noAnalytics : false
	},
	
	_getConfig : function(urlParam, defaultValue) {
		var param = AppEnv.getUrlVar(urlParam);
		if (param) {
			return true;
		} else {
			return defaultValue;
		}
	
	},
	
	isDevMode : function() {
		return AppEnv._getConfig("devMode", AppEnv.config.devMode);
	},
	
	isEmbedded : function() {
		return AppEnv._getConfig("embedded", AppEnv.config.embedded);
	},
	
	isPlanetDisabled : function() {
		return AppEnv._getConfig("disablePlanet", AppEnv.config.disablePlanet);
	},
	
	noAnalytics : function() {
		return AppEnv._getConfig("noga", AppEnv.config.noAnalytics);
	},
	

	getUrlVars: function() {
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++) {
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	getUrlVar: function(name){
		return AppEnv.getUrlVars()[name];
	}

};

