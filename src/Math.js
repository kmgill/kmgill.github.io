KMG.Math = {};


KMG.Math.sinh = function(a) {
	return (Math.exp(a) - Math.exp(-a)) / 2;
}

KMG.Math.cosh = function(a) {
	return (Math.pow(Math.E, a) + Math.pow(Math.E, -a)) / 2;
}

KMG.Math.sign = function(a) {
	return (a >= 0.0) ? 1 : -1;
}

KMG.Math.radians = function(d) {
	return d * (Math.PI / 180);
}

KMG.Math.degrees = function(r) {
	return r * (180 / Math.PI);
}

KMG.Math.sqr = function(v) {
	return v * v;
};

KMG.Math.clamp = function(v, within) {
	if (!within) {
		within = 360;
	}
	return v - within * Math.floor(v / within);
};




KMG.Math.dsin = function(v) {
	return Math.sin(v * Math.PI / 180);
};

KMG.Math.dcos = function(v) {
	return Math.cos(v * Math.PI / 180);
};

KMG.Math.dtan = function(v) {
	return Math.tan(v * Math.PI / 180);
};


KMG.Math.dasin = function(v) {
	return Math.asin(v) * 180 / Math.PI;
};

KMG.Math.dacos = function(v) {
	return Math.acos(v) * 180 / Math.PI;
};

KMG.Math.datan2 = function(y, x) {
	return Math.atan2(y, x) * 180 / Math.PI;
};

KMG.Math.datan = function(v) {
	return KMG.Math.dasin(v / Math.sqrt(Math.pow(v, 2) + 1));
};

KMG.Math.degToRad = function(v) {
	return v * KMG.PI_BY_180;
};

KMG.Math.radToDeg = function(v) {
	return v * KMG._180_BY_PI;
};

KMG.Math.round = function(v, factor) {
	if (!factor) {
		factor = 1000;
	}
	
	return Math.floor(v * factor) / factor;
};

KMG.Math.trimTo360Radians = function(x) {	
	if( x > 0.0 ) {
		while( x > KMG.RAD_360 )
			x = x-KMG.RAD_360;
	} else {
		while( x< 0.0 )
			x =x+ KMG.RAD_360;
	}
	return x;
}

KMG.Math.trimTo360 = function(x) {	
	if( x > 0.0 ) {
		while( x > 360.0 )
			x = x-360.0;
	} else {
		while( x< 0.0 )
			x =x+ 360.0;
	}
	return x;
}


KMG.Math.fixThetaDegrees = function(degrees){
	var limited;
    degrees /= 360.0;
    limited = 360.0 * (degrees - Math.floor(degrees));
    if (limited < 0)
		limited += 360.0;
	return limited;
}
        
KMG.Math.fixPhiDegrees = function(degrees) {
	degrees += 90.0;
	var limited;
	degrees /= 180.0;
	limited = 180.0 * (degrees - Math.floor(degrees));
	if (limited < 0)
			limited += 180.0;
	return limited - 90.0;
}




KMG.Math.getPoint3D = function(theta, // Longitude, in degrees
                               phi, // Latitude, in degrees
                               radius) {

	//theta += 90.0;
	theta = KMG.Math.fixThetaDegrees(theta) * KMG.PI_BY_180;
    phi = KMG.Math.fixPhiDegrees(phi) * KMG.PI_BY_180;

                
	var _y = Math.sqrt(KMG.Math.sqr(radius) - KMG.Math.sqr(radius * Math.cos(phi)));
    var r0 = Math.sqrt(KMG.Math.sqr(radius) - KMG.Math.sqr(_y));

    var _b = r0 * Math.cos(theta );
    var _z = Math.sqrt(KMG.Math.sqr(r0) - KMG.Math.sqr(_b));
    var _x = Math.sqrt(KMG.Math.sqr(r0) - KMG.Math.sqr(_z));

                
    if (theta <= KMG.RAD_90) {
		_z *= -1.0;
	} else if (theta  <= KMG.RAD_180) {
		_x *= -1.0;
		_z *= -1.0;
	} else if (theta  <= KMG.RAD_270) {
		_x *= -1.0;
	}

	if (phi >= 0) { 
		_y = Math.abs(_y);
	} else {
		_y = Math.abs(_y) * -1;
	}
	return new THREE.Vector3(_x, _y, _z);
}


// http://www.mathworks.com/help/aeroblks/radiusatgeocentriclatitude.html
KMG.Math.radiusAtGeocentricLatitude = function(equatorialRadius, latitude, flattening) {
	
	var R = equatorialRadius;
	var l = latitude;
	var f = flattening;
	
	var r = Math.sqrt(KMG.Math.sqr(R, 2) / (1 + (1 / KMG.Math.sqr(1 - f) - 1) * KMG.Math.sqr(Math.sin(l))));
	return r;
};




