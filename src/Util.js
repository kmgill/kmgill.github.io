
KMG.Util = {};

KMG.Util.isUserMobile = function()
{
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
}

KMG.Util.cardinalDirectionByValue = function(value, ifPos, ifNeg) {
	return (value >= 0) ? ifPos : ifNeg;
}

KMG.Util.formatDegrees = function(value, ifPos, ifNeg) {
	
	value = KMG.Math.round(value, 1000);
	
	var fmt = Math.abs(value) + "&deg;";
	if (ifPos && ifNeg) {
		fmt += KMG.Util.cardinalDirectionByValue(value, ifPos, ifNeg);
	}
	return fmt;
}

KMG.Util.formatDegreesToHours = function(value, ifPos, ifNeg) {
	
	var h = Math.floor(Math.abs(value));
	var m = Math.floor((Math.abs(value) - h) * 60);
	var s = KMG.Math.round(((Math.abs(value) - h) * 60 - m) * 60, 100);
	
	if (h < 10) {
		h = "0" + h;
	}
	
	if (m < 10) {
		m = "0" + m;
	}
	
	var fmt = h + "h " + m + "m " + s + "s";
	if (ifPos && ifNeg) {
		fmt += KMG.Util.cardinalDirectionByValue(value, ifPos, ifNeg);
	}
	return fmt;
}

KMG.Util.formatDegreesToMinutes = function(value, ifPos, ifNeg, skipSeconds) {
	
	var d = Math.floor(Math.abs(value));
	var m = Math.floor((Math.abs(value) - d) * 60);
	var s = KMG.Math.round(((Math.abs(value) - d) * 60 - m) * 60, 100);
	
	var sign = (value < 0) ? "-" : " ";
	
	var fmt = sign + d + "&deg; " + m + "\' " + ((!skipSeconds) ? (s + "\"") : "");
	if (ifPos && ifNeg) {
		fmt += KMG.Util.cardinalDirectionByValue(value, ifPos, ifNeg);
	}
	return fmt;
}


KMG.Util.intensityToWhiteColor = function(intensity)
{
	intensity = parseInt(intensity);
	var rgb = "rgb("+intensity+","+intensity+","+intensity+")";
	return new THREE.Color(rgb);
};

KMG.Util.arrayToColor = function(array)
{
	var r = parseInt(array[0]);
	var g = parseInt(array[1]);
	var b = parseInt(array[2]);
	var a = (array.length >= 4) ? parseInt(array[3]) : 255.0;
	var rgb = "rgb("+r+","+g+","+b+")";
	return new THREE.Color(rgb);
};

KMG.Util.rgbToArray = function(rgb)
{
	var c = new THREE.Color(rgb);
	return new THREE.Vector3(c.r, c.g, c.b);
}


KMG.Util.eyePosition = function(context)
{
	return context.camera.position;
};
	
KMG.Util.eyeDistanceToCenter = function(context)
{
	return context.primaryScene.position.distanceTo(KMG.Util.eyePosition(context));
};
	
KMG.Util.surfaceDistance = function(context, radius)
{
	return KMG.Util.eyeDistanceToCenter(context) - radius;
};


//farClipDistance
KMG.Util.horizonDistance = function(context, radius)
{
	var r = radius;
	var e = KMG.Util.surfaceDistance(context, radius);
	var f = Math.sqrt(e * (2 * r + e));
	return f;
};

// TODO: Strengthen this...
KMG.Util.clone = function(object) 
{
	if (typeof object !== "object") {
		return object;
	}

	var cloned;
	
	if (object instanceof Array) {
		cloned = new Array();
		for (var i = 0; i < object.length; i++) {
			cloned.push(KMG.Util.clone(object[i]));
		}
	} else {
		cloned = {};
		for(var key in object) {
			cloned[key] = KMG.Util.clone(object[key]);
		};
	}
	
	return cloned;
};

// TODO: Strengthen this...
KMG.Util.extend = function(target, source) {

	//var extended = KMG.Util.clone(target);
	var extended = target;
	for(var key in source) {
		if (key === "displayClouds") {
			var snoofle;
		}
		if (extended[key] === undefined) {
			extended[key] = KMG.Util.clone(source[key]);
		}
		
		if (extended[key] && typeof extended[key] === "object") {
			extended[key] = KMG.Util.extend(extended[key], source[key]);
		}
	
	}
	
	return extended;
};

//http://stackoverflow.com/questions/1714786/querystring-encoding-of-a-javascript-object
KMG.Util.serialize = function(obj, prefix) {
	var str = [];
	for(var p in obj) {
		var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
		str.push(typeof v == "object" ? KMG.Util.serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
	}
	return str.join("&");
};

/*
KMG.Util.getTimezoneOffset = function() {
	return (new Date()).getTimezoneOffset() * 1000;
};

KMG.Util.getTimezoneOffsetJulians = function() {
	return (new Date()).getTimezoneOffset() / 60 / 24;
};
*/


KMG.Util.replaceWithGreekLetters = function(str) {
	
	str = str.replace(/alpha/g, 'α');
	str = str.replace(/beta/g, 'β');
	
	str = str.replace(/gamma/g, 'γ');
	str = str.replace(/delta/g, 'δ');
	str = str.replace(/epsilon/g, 'ε');
	str = str.replace(/zeta/g, 'ζ');
	str = str.replace(/eta/g, 'η');
	str = str.replace(/theta/g, 'θ');
	str = str.replace(/iota/g, 'ι');
	str = str.replace(/kappa/g, 'κ');
	str = str.replace(/lambda/g, 'λ');
	str = str.replace(/mu/g, 'μ');
	str = str.replace(/nu/g, 'ν');
	str = str.replace(/xi/g, 'ξ');
	str = str.replace(/omicron/g, 'ο');
	str = str.replace(/pi/g, 'π');
	str = str.replace(/rho/g, 'ρ');
	str = str.replace(/sigma/g, 'σ');
	str = str.replace(/tau/g, 'τ');
	str = str.replace(/upsilon/g, 'υ');
	str = str.replace(/phi/g, 'φ');
	str = str.replace(/chi/g, 'χ');
	str = str.replace(/psi/g, 'ψ');
	str = str.replace(/omega/g, 'ω');
	
	
	
	return str;
};

KMG.Util.replaceWithGreekLettersAbbreviated = function(str) {
	
	str = str.replace(/Alp/g, 'α');
	str = str.replace(/Bet/g, 'β');
	
	str = str.replace(/Gam/g, 'γ');
	str = str.replace(/Del/g, 'δ');
	str = str.replace(/Eps/g, 'ε');
	str = str.replace(/Zet/g, 'ζ');
	str = str.replace(/Eta/g, 'η');
	str = str.replace(/The/g, 'θ');
	str = str.replace(/Iot/g, 'ι');
	str = str.replace(/Kap/g, 'κ');
	str = str.replace(/Lam/g, 'λ');
	str = str.replace(/Mu/g, 'μ');
	str = str.replace(/Nu/g, 'ν');
	str = str.replace(/Xi/g, 'ξ');
	str = str.replace(/Omi/g, 'ο');
	str = str.replace(/Pi/g, 'π');
	str = str.replace(/Rho/g, 'ρ');
	str = str.replace(/Sig/g, 'σ');
	str = str.replace(/Tau/g, 'τ');
	str = str.replace(/Ups/g, 'υ');
	str = str.replace(/Phi/g, 'φ');
	str = str.replace(/Chi/g, 'χ');
	str = str.replace(/Psi/g, 'ψ');
	str = str.replace(/Ome/g, 'ω');
	
	
	
	return str;
};

/** A best-effort attempt to convert a string to an intended data type when the intended type may not be known.
 * Returns the supplied parameter as-is if the type cannot be determined as anything other than a string.
 * 
 */ 
KMG.Util.stringToDataType = function(v) {
	if (/^true$/.test(v))
		return true;
	else if (/^false$/.test(v))
		return false;
	else if (/^-?\d+\.?\d*$/.test(v)) 
		return parseFloat(v);
	else if (/\,/.test(v)) {
		var a = v.split(",");
		var list = [];
		for (var i = 0; i < a.length; i++) {
			list.push(KMG.Util.stringToDataType(a[i]));
		}
		return list;
	} else {
		v = v.replace(/%20/g, " ");
		return v;
	}
}
