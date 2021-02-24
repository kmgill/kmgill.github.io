

KMG.Location = {};



	
KMG.Location.isPreciseLocationSupported = function() {
	if (navigator.geolocation)
		return true;
	else
		return false;
};
	
KMG.Location.getPreciseLocation = function(onLocation) {
	if (!KMG.Location.isPreciseLocationSupported()) {
		return false;
	}
	
	navigator.geolocation.getCurrentPosition(onLocation);
	return true;
};
	
	
