/**
 * Astronomy Algorithms
 * http://www.apoapsys.com
 * 
 * Copyright 2014 Kevin M. Gill <kmsmgill@gmail.com>
 *
 * Uses algorithms from:
 *
 * 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

KMG.Astro = {};
 
KMG.Astro.J2000 = 2451545.0;
KMG.Astro.J1900 = 2415020.0;
 
// http://www.csgnetwork.com/juliangregcalconv.html
KMG.Astro.julianToDate = function(jd) {
	var _jd = jd;
		
	jd += 0.5;
	var z = Math.floor(jd);
	var f = jd - z;
	if (z < 2299161) {
		var A = z;
	} else {
		var omega = Math.floor((z-1867216.25)/36524.25);
		var A = z + 1 + omega - Math.floor(omega/4);
	}
	var B = A + 1524;
	var C = Math.floor((B-122.1)/365.25);
	var D = Math.floor(365.25*C);
	var Epsilon = Math.floor((B-D)/30.6001);
	var dayGreg = B - D - Math.floor(30.6001*Epsilon) + f;
	var monthGreg, yearGreg;
	if (Epsilon < 14) {
		monthGreg = Epsilon - 1;
	} else {
		monthGreg = Epsilon - 13;
	}
	if (monthGreg > 2) {
		yearGreg = C - 4716;
	} else {
		yearGreg = C - 4715;
	}
	
	var year = yearGreg;
	var month = monthGreg;
	var day = Math.floor(dayGreg);
	
	var dayMinutes = ((dayGreg - day) * 1440.0);
	var hour = Math.floor(dayMinutes / 60.0);
	var minute = Math.floor(dayMinutes - (hour * 60.0));
	var second = Math.floor(60.0 * (dayMinutes - (hour * 60.0) -minute));
	var millisecond =  (1000.0 * (60.0 * (dayMinutes - (hour * 60.0) -minute)- second) );
	
	return new Date(year, month - 1, day, hour, minute, second, millisecond);
};
KMG.Util.julianToDate = KMG.Astro.julianToDate;

// http://www.csgnetwork.com/juliandatetime.html
KMG.Astro.dateToJulian = function(year, month, day, hour, minute, second, millisecond, tz) {

	/*
	var extra = 100.0*year + month - 190002.5;
	var rjd = 367.0*year;
	rjd -= Math.floor(7.0*(year+Math.floor((month+9.0)/12.0))/4.0);
	rjd += Math.floor(275.0*month/9.0) ;
	rjd += day;
	rjd += (hour + (minute + second/60.0)/60.)/24.0;
	rjd += 1721013.5;
	rjd -= 0.5*extra/Math.abs(extra);
	rjd += 0.5;
	
	return rjd;*/
	if (!tz) {
		tz = 0;
	}
	if (!millisecond) {
		millisecond = 0;
	}
	var day_decimal, julian_day, a;

	day_decimal = day + (hour - tz + (minute + second / 60.0 + millisecond / 1000 / 60) / 60.0) / 24.0;

	if (month < 3) {
		month += 12;
		year--;
	}

	julian_day = Math.floor(365.25 * (year + 4716.0)) + Math.floor(30.6001 * (month + 1)) + day_decimal - 1524.5;
	if (julian_day > 2299160.0) {
		a = Math.floor(year / 100);
		julian_day += (2 - a + Math.floor(a / 4));
	}
	
	return julian_day;
};
KMG.Util.dateToJulian = KMG.Astro.dateToJulian;

KMG.Astro.millisToJulian = function(millis) {
	var d = new Date(millis);
	var jd =  KMG.Util.dateToJulian(d.getFullYear(),
							d.getMonth() + 1,
							d.getDate(),
							d.getHours(),
							d.getMinutes(),
							d.getSeconds(),
							d.getMilliseconds());
	return jd;
};
KMG.Util.millisToJulian = KMG.Astro.millisToJulian;

KMG.Astro.julianNow = function() {
	var d = new Date();
	return KMG.Util.dateToJulian(d.getUTCFullYear(),
						d.getUTCMonth() + 1,
						d.getUTCDate(),
						d.getUTCHours(),
						d.getUTCMinutes(),
						d.getUTCSeconds(),
						d.getUTCMilliseconds());
	
}
KMG.Util.julianNow = KMG.Astro.julianNow;

KMG.Astro.formatJulianDay = function(jd, isUtc, format) {
	if (!format) {
		format = "LLL";
	}
	var dt = KMG.Util.julianToDate(jd);
	if (isUtc) 
		return moment(dt).format(format);
	else 
		return moment(dt).utc().format(format);
};
KMG.Util.formatJulianDay = KMG.Astro.formatJulianDay;




KMG.Astro.convertCartesianEquatorialToEcliptic = function(equatorial) {
	var e = 23.4 * KMG.PI_BY_180;
	
	var m = new THREE.Matrix3();
	m.set(1, 0, 0, 
		  0, Math.cos(e), Math.sin(e), 
		  0, -Math.sin(e), Math.cos(e));
	
	var ecliptic = equatorial.clone().applyMatrix3(m);
	return ecliptic;
};
KMG.Math.convertCartesianEquatorialToEcliptic = KMG.Astro.convertCartesianEquatorialToEcliptic;



// Duffet-Smith, Peter: Practical Astronomy with Your Calculator, page 42
KMG.Astro.convertEquatorialToEcliptic = function(ra, dec) {
	var e = 23.4;
	
	var Y = KMG.Math.dsin(ra) * KMG.Math.dcos(e) + KMG.Math.dtan(dec) * KMG.Math.dsin(e);
	var X = KMG.Math.dcos(ra);
	
	var l = KMG.Math.datan2(Y, X);
	var b = KMG.Math.dasin(KMG.Math.dsin(dec) * KMG.Math.dcos(e) - KMG.Math.dcos(dec) * KMG.Math.dsin(e) * KMG.Math.dsin(ra));
	
	return {
		l : l,
		b : b
	};
};
KMG.Math.convertEquatorialToEcliptic = KMG.Astro.convertEquatorialToEcliptic;

// Adapted from Celestia customorbits.cpp:
// static double Obliquity(double t)
KMG.Astro.obliquity = function(t)
{
    // Parameter t represents the Julian centuries elapsed since 1900.
    // In other words, t = (jd - 2415020.0) / 36525.0

    return (2.345229444E1 - ((((-1.81E-3*t)+5.9E-3)*t+4.6845E1)*t)/3600.0) * KMG.PI_BY_180;
}
KMG.Math.obliquity = KMG.Astro.obliquity;

// Adapted from Celestia customorbits.cpp:
// static void Nutation(double t, double &deps, double& dpsi)
KMG.Astro.nutation = function(t)
{
    // Parameter t represents the Julian centuries elapsed since 1900.
    // In other words, t = (jd - 2415020.0) / 36525.0

    var ls, ld;	// sun's mean longitude, moon's mean longitude
    var ms, md;	// sun's mean anomaly, moon's mean anomaly
    var nm;	    // longitude of moon's ascending node
    var t2;
    var tls, tnm, tld;	// twice above
    var a, b;

    t2 = t*t;

    a = 100.0021358*t;
    b = 360.*(a-Math.floor(a));
    ls = 279.697+.000303*t2+b;

    a = 1336.855231*t;
    b = 360.*(a-Math.floor(a));
    ld = 270.434-.001133*t2+b;

    a = 99.99736056000026*t;
    b = 360.*(a-Math.floor(a));
    ms = 358.476-.00015*t2+b;

    a = 13255523.59*t;
    b = 360.*(a-Math.floor(a));
    md = 296.105+.009192*t2+b;

    a = 5.372616667*t;
    b = 360.*(a-Math.floor(a));
    nm = 259.183+.002078*t2-b;

    //convert to radian forms for use with trig functions.
    tls = 2*KMG.Math.degToRad(ls);
    nm = KMG.Math.degToRad(nm);
    tnm = 2*KMG.Math.degToRad(nm);
    ms = KMG.Math.degToRad(ms);
    tld = 2*KMG.Math.degToRad(ld);
    md = KMG.Math.degToRad(md);

    // find delta psi and eps, in arcseconds.
    var dpsi = (-17.2327-.01737*t)*Math.sin(nm)+(-1.2729-.00013*t)*Math.sin(tls)
        +.2088*Math.sin(tnm)-.2037*Math.sin(tld)+(.1261-.00031*t)*Math.sin(ms)
        +.0675*Math.sin(md)-(.0497-.00012*t)*Math.sin(tls+ms)
        -.0342*Math.sin(tld-nm)-.0261*Math.sin(tld+md)+.0214*Math.sin(tls-ms)
        -.0149*Math.sin(tls-tld+md)+.0124*Math.sin(tls-nm)+.0114*Math.sin(tld-md);
    var deps = (9.21+.00091*t)*Math.cos(nm)+(.5522-.00029*t)*Math.cos(tls)
        -.0904*Math.cos(tnm)+.0884*Math.cos(tld)+.0216*Math.cos(tls+ms)
        +.0183*Math.cos(tld-nm)+.0113*Math.cos(tld+md)-.0093*Math.cos(tls-ms)
        -.0066*Math.cos(tls-nm);

    // convert to radians.
    dpsi = (dpsi/3600) * KMG.PI_BY_180;
    deps = (deps/3600) * KMG.PI_BY_180;
    
    //double &deps, double& dpsi
    return {
		deps : deps,
		dpsi : dpsi
	};
}
KMG.Math.nutation = KMG.Astro.nutation;


// Adapted from Celestia customorbits.cpp:
// static void EclipticToEquatorial(double t, double fEclLat, double fEclLon,
//                                 double& RA, double& dec) 
KMG.Astro.convertEclipticToEquatorial = function(jd, fEclLat, fEclLon)
{
    // Parameter t represents the Julian centuries elapsed since 1900.
    // In other words, t = (jd - 2415020.0) / 36525.0

    var seps, ceps;	// sin and cos of mean obliquity
    var sx, cx, sy, cy, ty;
    var eps;
	var dec, ra;
	
	
	var t = (jd - 2415020.0) / 36525.0;
   // t = (2451545.0 - 2415020.0) / 36525.0;
   // t = 0;
    eps = KMG.Math.obliquity(t);		// mean obliquity for date
    var nut = KMG.Math.nutation(t);
    var deps = nut.deps;
    var dpsi = nut.dpsi;
    
    eps += deps;
    seps = Math.sin(eps);
    ceps = Math.cos(eps);

    sy = Math.sin(fEclLat);
    cy = Math.cos(fEclLat);				// always non-negative
    if (Math.abs(cy)<1e-20)
        cy = 1e-20;		// insure > 0
    ty = sy/cy;
    cx = Math.cos(fEclLon);
    sx = Math.sin(fEclLon);
    dec = Math.asin((sy*ceps)+(cy*seps*sx));
    
  //  ra = Math.atan(((sx*ceps)-(ty*seps))/cx);
	ra = Math.atan2(((sx*ceps)-(ty*seps)), cx);
    //if (cx<0)
   //     ra += Math.PI;		// account for atan quad ambiguity
	ra = KMG.Math.clamp(ra, 2 * Math.PI);
    
    
    return {
		ra : ra,
		dec : dec
	};
};
KMG.Math.convertEclipticToEquatorial = KMG.Astro.convertEclipticToEquatorial;

// Convert equatorial coordinates from one epoch to another.  Method is from
// Chapter 21 of Meeus's _Astronomical Algorithms_
// Actuall adapted from Celestia customorbits.cpp:
//void EpochConvert(double jdFrom, double jdTo,
//                  double a0, double d0,
//                  double& a, double& d)
KMG.Astro.epochConvert = function(jdFrom, jdTo, a0, d0)
{
	var a, d;
	
    var T = (jdFrom - 2451545.0) / 36525.0;
    var t = (jdTo - jdFrom) / 36525.0;

    var zeta = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * t +
        (0.30188 - 0.000344 * T) * t * t + 0.017998 * t * t * t;
    var z = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * t +
        (1.09468 + 0.000066 * T) * t * t + 0.018203 * t * t * t;
    var theta = (2004.3109 - 0.85330 * T - 0.000217 * T * T) * t -
        (0.42665 + 0.000217 * T) * t * t - 0.041833 * t * t * t;
    zeta  = KMG.Math.degToRad(zeta / 3600.0);
    z     = KMG.Math.degToRad(z / 3600.0);
    theta = KMG.Math.degToRad(theta / 3600.0);

    var A = Math.cos(d0) * Math.sin(a0 + zeta);
    var B = Math.cos(theta) * Math.cos(d0) * Math.cos(a0 + zeta) -
        Math.sin(theta) * Math.sin(d0);
    var C = Math.sin(theta) * Math.cos(d0) * Math.cos(a0 + zeta) +
        Math.cos(theta) * Math.sin(d0);

    a = Math.atan2(A, B) + z;
    d = Math.asin(C);
    
    return {
		ra : a,
		dec : d
	};
};
KMG.Math.epochConvert = KMG.Astro.epochConvert;



//http://www.satellite-calculations.com/TLETracker/scripts/tletracker.online.sat.calc
KMG.Astro.getGMST2 = function(lon, _jd) {
	if (!lon) {
		lon = 0.0; // Handle null or undefined
	}
	if (!_jd) {
		_jd = KMG.Astro.julianNow();
	}
	
	var dt = KMG.Astro.julianToDate(_jd);
	var day = dt.getDate();
	var month = dt.getMonth() + 1;
	var year = dt.getFullYear();
	var hour = dt.getHours();
	var minute  = dt.getMinutes();
	var second = dt.getSeconds();
	var ms = dt.getMilliseconds();
	if( month == 1 || month == 2 )
	{
	year = year - 1;
	month = month + 12;
	}

	var a = Math.floor( year/100 );
	var b = 2 - a + Math.floor( a/4 );

	var c = Math.floor(365.25 * year);
	var d = Math.floor(30.6001 * (month + 1));

	// days since J2000.0   
	var jd = b + c + d - 730550.5 + day + (hour + minute/60.0 + second/3600.0)/24.0;
	
	var jt   = (jd)/36525.0;                   // julian centuries since J2000.0         
	var GMST = 280.46061837 + 360.98564736629*jd + 0.000387933*jt*jt - jt*jt*jt/38710000 + lon;           
	if( GMST > 0.0 )
	{
		while( GMST > 360.0 )
			GMST -= 360.0;
	}
	else
	{
		while( GMST < 0.0 )
			GMST += 360.0;
	}
		
	return GMST;
};


KMG.Astro.div = function(a, b) {
	return ((a-a%b)/b);
};


KMG.Astro.getDayNumber = function(_jd) {
	var dt = KMG.Astro.julianToDate(_jd);
	var dd = dt.getDate();
	var mm = dt.getMonth() + 1;
	var yyyy = dt.getFullYear();
	var hh = dt.getHours();
	var min  = dt.getMinutes();
	var sec = dt.getSeconds();
	var ms = dt.getMilliseconds();

	var d=367.0*yyyy - KMG.Astro.div(  (7.0*(yyyy+(KMG.Astro.div((mm+9.0),12.0)))),4.0 ) + KMG.Astro.div((275.0*mm),9.0) + dd - 730530.0 ;
	d=d+ hh/24.0 + min/(60.0*24.0) + sec/(24.0*60.0*60.0);

	return d;
};

KMG.Astro.getDayNumberNow = function() {
	return KMG.Astro.getDayNumber(KMG.Astro.julianNow());
};


KMG.Astro.getGMST = function(jd, clampTo) {
	if (!clampTo) {
		clampTo = 24;
	}
	var jd0 = Math.floor(jd + 0.5) - .5;
	var H = (jd - jd0) * 24;
	var D = jd - 2451545.0;
	var D0 = jd0 - 2451545.0;
	var T = D / 36525.0;
	var gmst = (6.697374558 + 0.06570982441908 * D0 + 1.00273790935 * H + 0.000026 * Math.pow(T, 2));
	gmst = KMG.Math.clamp(gmst, clampTo);
	return gmst;
};

KMG.Astro.getLMST = function(jd, lon) {
	var gst = KMG.Astro.getGMST(jd);
	return gst + (lon / 15);
};

KMG.Astro.getDayOfYear = function(jd) {
	var date = KMG.Astro.julianToDate(jd);
	var start = new Date(date.getFullYear(), 0, 0);
	var diff = date - start;
	var oneDay = 1000 * 60 * 60 * 24;
	var day = Math.floor(diff / oneDay);
	return day;
};


KMG.Astro.vectorToHeliocentricLatitudeLongitude = function(vec, skipRotation) {
	/* Opposite of
	var x = Math.cos(l) * Math.sin(b) * r;
	var y = Math.cos(b) * r;
	var z = -Math.sin(l) * Math.sin(b) * r;
	*/
	
	var x, y, z;

	x = vec.x;
	y = vec.y;
	z = vec.z;
	
	var r = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2) + Math.pow(vec.z, 2));
	b = Math.abs(Math.acos(y / r)) * ((z < 0) ? -1 : 1);
	l = 2 * Math.PI - Math.acos((vec.x * (1 / Math.sin(b))) / r); 

	var rotB = (skipRotation) ? 0 : Math.PI / 2;
	var rotL = (skipRotation) ? 0 : -Math.PI;
	
	return {
		 r : r,
		 b : (b + rotB) * KMG._180_BY_PI,
		 l : (l + rotL) * KMG._180_BY_PI,
	 };
	
};



KMG.Astro.calculatePositionVector = function(date, orbit) {
	var position = orbit.positionAtTime(date.getJulianDay(), false);
	var E = position.E;
	var M = position.M;
	var trueAnomaly = position.trueAnomaly;
	
	return {
		x : position.x,
		y : position.y,
		z : position.z,
		E : position.E,
		M : position.M,
		trueAnomaly : position.trueAnomaly
	};
};

/**
 *
 * @param date
 * @param 
 */
//KMG.Astro.calculateSatellitePosition = function(date, p, E, M) {
KMG.Astro.calculateSatellitePosition = function(date, orbit) {

	var position = orbit.positionAtTime(date.getJulianDay(), false);
	var E = position.E;
	var M = position.M;
	var trueAnomaly = position.trueAnomaly;

	
	
	var semiMajorAxis = orbit.orbitProperties.semiMajorAxis;
	var arg_per = orbit.orbitProperties.argOfPeriapsis;
	var RAAN = orbit.orbitProperties.rightAscension;
	var i = orbit.orbitProperties.inclination * KMG.PI_BY_180;
	var e = orbit.orbitProperties.eccentricity;
	
	//var Epoch_now = date.getJulianDay() - apoapsys.J2000;
	var Epoch_now = date.getDayNumber();
	var Epoch_start = orbit.orbitProperties.epochStart;
	var Earth_equatorial_radius = 6378.135;
	

	var first_derative_mean_motion = orbit.orbitProperties.derivativeOfMeanMotion;
	var Satellite_rev_sidereal_day = orbit.orbitProperties.meanMotion;
	
	var TCdecimal=(1440/((1*Satellite_rev_sidereal_day)+(first_derative_mean_motion*(Epoch_now-Epoch_start )))) /60;   // Period in hours


	// bug here ?
	var RangeA=Math.pow(    (6028.9* (TCdecimal*60)), (2/3)   );
	
	
	var apogee =RangeA*(1+e*1);   // apogee
	var perigee=RangeA*(1-e*1);  //perigee
	var semimajoraxsis=(1*apogee+1*perigee)/2;  // semimajoraxsis
	

	
	perigee_perturbation=(Epoch_now-Epoch_start)*4.97*Math.pow((Earth_equatorial_radius/(1*semimajoraxsis)) , 3.5   )* (  5*Math.cos(i)*Math.cos(i) -1)/((1-e*e)*(1-e*e));

	// perturbation of ascending node

	ascending_node_perturbation=(Epoch_now-Epoch_start)*9.95*Math.pow((Earth_equatorial_radius/(1*semimajoraxsis)) , 3.5   )*   Math.cos(i)/((1-e*e)*(1-e*e));


	// perbutation of perigee
	arg_per=arg_per +perigee_perturbation;
	RAAN=RAAN-ascending_node_perturbation;

	arg_per *= KMG.PI_BY_180;
	RAAN *= KMG.PI_BY_180;

	var X0=1.0*semiMajorAxis*(Math.cos(E)-e);  //  = r*Cos(trueanomaly)
	var Y0=1.0*semiMajorAxis*Math.sqrt(1-e*e)*Math.sin(E);  // = r*sin (trueanomaly)
	var r=Math.sqrt(X0*X0+Y0*Y0); // distance
	
	X0 *= KMG.AU_TO_KM;
	Y0 *= KMG.AU_TO_KM;
	r *= KMG.AU_TO_KM;
	
	var Px = Math.cos(arg_per)*Math.cos(RAAN) - Math.sin(arg_per)*Math.sin(RAAN)*Math.cos(i);
	var Py = Math.cos(arg_per)*Math.sin(RAAN) + Math.sin(arg_per)*Math.cos(RAAN)*Math.cos(i);
	var Pz = Math.sin(arg_per)*Math.sin(i);

	var Qx=-Math.sin(arg_per)*Math.cos(RAAN)-Math.cos(arg_per)*Math.sin(RAAN)*Math.cos(i);
	var Qy=-Math.sin(arg_per)*Math.sin(RAAN)+Math.cos(arg_per)*Math.cos(RAAN)*Math.cos(i);
	var Qz=Math.cos(arg_per)*Math.sin(i);
	
	x=Px*X0+Qx*Y0;
	y=Py*X0+Qy*Y0;
	z=Pz*X0+Qz*Y0;

	
	var dec = Math.atan2(  z,Math.sqrt(x*x+y*y)  );
	var ra = Math.atan2(  y,x );

	
	ra = ra%(2 * Math.PI);

	var gmst = date.getGMST2(0);
	
	var lon = Math.atan2( y,x ) - (gmst * KMG.PI_BY_180);
	lon = KMG.Math.clamp(lon, 2 * Math.PI);
	
	if (lon > Math.PI) {
		lon = -1 * (2 * Math.PI - lon);
	}
	
	var lat = Math.atan2(  z,Math.sqrt(x*x+y*y)  );

	var radius = KMG.Math.radiusAtGeocentricLatitude(Earth_equatorial_radius, lat, 0.0033528);
	
	var altitude = Math.sqrt(x*x+y*y+z*z) - radius;
	var rh = (radius + altitude);
	var theta = Math.acos(radius / rh);
	var t = (6.284*rh)*(Math.sqrt(rh/398600))/60;
	
	var angularRange = radius * Math.tan(theta);
	var surfaceRange = 220 * (theta * KMG._180_BY_PI);
	var vis = ((2*theta*KMG._180_BY_PI)/360)*t;
	
	var maxAngularRange = .5 * Math.PI * 6378.135;
	if (angularRange > maxAngularRange) {
		angularRange = maxAngularRange;
	}
	
	//pos.ra_hms = apoapsys.Util.formatDegreesToHours(pos.ra / 15);
	//	pos.dec_dms = apoapsys.Util.formatDegreesToMinutes(pos.dec);
	return {
		ra : ra * KMG._180_BY_PI,
		ra_hms : KMG.Util.formatDegreesToHours(ra * KMG._180_BY_PI / 15),
		dec : dec * KMG._180_BY_PI,
		dec_dms : KMG.Util.formatDegreesToMinutes(dec * KMG._180_BY_PI),
		lat : lat * KMG._180_BY_PI,
		lon : lon * KMG._180_BY_PI,
		altitude : altitude,
		angularRange : angularRange,
		surfaceRange : surfaceRange,
		visibilityTimeMinutes : vis,
		eccentricAnomaly : E,
		meanAnomaly : M,
		trueAnomaly : trueAnomaly,
		
		xyz : {
			x : x, 
			y : y,
			z : z
		}
	};
};



KMG.Astro.getPositionAzimuthalSatellite = function(date, orbit, lat, lon) {
	//var equatorial = getPositionEquatorial(date, fromObject);
	//lat = 42.76537;
	//lon = -71.46757;
	
	var equatorial = KMG.Astro.calculateSatellitePosition(date, orbit);
	
	var dlon = lon;
	var dlat = lat;
	lat = lat * KMG.PI_BY_180;
	lon = lon * KMG.PI_BY_180;
	var ra = equatorial.ra * KMG.PI_BY_180;
	var dec = equatorial.dec * KMG.PI_BY_180;


	var gmst = date.getGMST2(0);
	var lst = gmst + (dlon / 15);
	
	var ha = lst - (((ra * KMG._180_BY_PI) / 15));
	var f = 0.0033528;
	var e2 = 2 * f - f * f;
	var C=1/Math.sqrt(1+0.0033528*(0.0033528-2)*Math.sin(lat)*Math.sin(lat)             );
	var omega=(1*gmst+1*dlon) * KMG.PI_BY_180;

	var Re = 6378.135;
	var C = 1 / Math.sqrt(1 - e2 * Math.pow(Math.sin(lat), 2));
	var S=(1-0.0033528)*(1-0.0033528)*C;
	var R =  Re * Math.cos(lat);
	var a = Re;
	
	/*
	console.info("omega: " + (omega * KMG._180_BY_PI));
	console.info("C: " + C);
	console.info("S: " + S);
	console.info("R: " + R);
	console.info("lat: " + (lat * KMG._180_BY_PI));
	console.info("lon: " + (lon * KMG._180_BY_PI));
	console.info("GMST: " + gmst);
	*/
	
	var x_ = a * C * Math.cos(lat) * Math.cos(omega);
	var y_ = a * C * Math.cos(lat) * Math.sin(omega);
	var z_=6378.135*S*Math.sin(lat);
	//console.info([x_, y_, z_]);

	var xs = equatorial.xyz.x;
	var ys = equatorial.xyz.y;
	var zs = equatorial.xyz.z;
	
	
	
	var xo = x_;
	var yo = y_;
	var zo = z_;
	
	//console.info(["sat", xs, ys, zs]);
	//console.info(["Obs", xo, yo, zo]);
	
	var rx=xs-xo;
	var ry=ys-yo;
	var rz=zs-zo;
	
	//console.info(["rxyz", rx, ry, rz]); 
	
	fi=(1*gmst+1*dlon)*KMG.PI_BY_180;
	var rS=Math.sin(lat)*Math.cos(fi)*rx+Math.sin(lat)*Math.sin(fi)*ry-Math.cos(lat)*rz;
	var rE=-Math.sin(fi)*rx+Math.cos(fi)*ry;
	var rZ=Math.cos(lat)*Math.cos(fi)*rx+Math.cos(lat)*Math.sin(fi)*ry+Math.sin(lat)*rz;
	//console.info("fi: " + (fi * KMG._180_BY_PI));
	//console.info(["rSEZ", rS, rE, rZ]);

	var range=Math.sqrt(rS*rS+rE*rE+rZ*rZ);
	//console.info("range: " + range);
	var Elevation=Math.asin(rZ/range);
	var Azimuth=Math.atan(-rE/rS);

	if (rS>0) Azimuth=Azimuth+Math.PI;
	if (Azimuth<0) Azimuth=Azimuth+ 2*Math.PI;

	var alt = Elevation;
	var az = Azimuth;

	if (az < 0) {
		az += 2 * Math.PI;
	}
	
	//console.info("Azimuth: " + (az * KMG._180_BY_PI));
	//console.info("Elevation: " + (alt * KMG._180_BY_PI));
	
	return {
		alt : alt * KMG._180_BY_PI,
		az : KMG.Math.clamp(az * KMG._180_BY_PI, 360),
		ha : ha,
		lst : lst,
		lst_hms : KMG.Util.formatDegreesToHours(lst),
		range : range,
		gmst : gmst
	};

};


KMG.Astro.getHeliocentricPosition = function(date, orbit) {

	var position = orbit.positionAtTime(date.getJulianDay(), false);
	var parentPosition, heliocentricPosition;

	if (orbit.parentOrbit) {
		parentPosition = orbit.parentOrbit.positionAtTime(date.getJulianDay(), false);
		heliocentricPosition = parentPosition.clone().add(position);
	} else {
		heliocentricPosition = position;
	}
	
	return heliocentricPosition;
}

KMG.Astro.getHeliocentricPositionEquatorial = function(date, orbit, fromObjectOrbit) {
	
	var heliocentricPosition = KMG.Astro.getHeliocentricPosition(date, orbit);
		
	// fromObject is assumed to be Earth
	if (fromObjectOrbit) {
		var fromHeliocentricPosition = KMG.Astro.getHeliocentricPosition(date, fromObjectOrbit);
		heliocentricPosition.sub(fromHeliocentricPosition);
	}
	
	var pos;
	
	var eclipticPos = KMG.Astro.vectorToHeliocentricLatitudeLongitude(heliocentricPosition);
	pos = KMG.Math.convertEclipticToEquatorial(date.getJulianDay(), eclipticPos.b *KMG.PI_BY_180, eclipticPos.l *KMG.PI_BY_180);
	pos = KMG.Math.epochConvert(date.getJulianDay(), 2451545.0, pos.ra, pos.dec);
	pos.ra *= KMG._180_BY_PI;
	pos.dec *= KMG._180_BY_PI;
	if (pos.dec < 0) {
		pos.ra += 180;
	}

	if (!pos.ra_hms) {
		pos.ra_hms = KMG.Util.formatDegreesToHours(pos.ra / 15);
	}
	if (!pos.dec_dms) {
		pos.dec_dms = KMG.Util.formatDegreesToMinutes(pos.dec);
	}

	return pos;
};
	
	
KMG.Astro.getPositionAzimuthalHeliocentricBody = function(date, orbit, fromObjectOrbit, lat, lon) {

	var equatorial = KMG.Astro.getHeliocentricPositionEquatorial(date, orbit, fromObjectOrbit);

	var dlon = lon;
	var dlat = lat;
	lat = lat * KMG.PI_BY_180;
	lon = lon * KMG.PI_BY_180;
	var ra = equatorial.ra * KMG.PI_BY_180;
	var dec = equatorial.dec * KMG.PI_BY_180;

	var lst = date.getLMST(dlon);

	var ha = lst - (((ra * KMG._180_BY_PI) / 15));

	var H = ha * 15 * KMG.PI_BY_180;
	var alt = Math.asin(Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(H));
	var az = Math.asin(-Math.sin(H) * Math.cos(dec) / Math.cos(alt));
	//alt += (h * KMG.PI_BY_180);
	
	var Y = -Math.sin(H);
	var X = Math.cos(lat) * Math.tan(dec) - Math.sin(lat) * Math.cos(H);
	var az = Math.atan2(Y, X);

	if (az < 0) {
		az += 2 * Math.PI;
	}

	return {
		alt : alt * KMG._180_BY_PI,
		az : KMG.Math.clamp(az * KMG._180_BY_PI, 360),
		ha : ha,
		lst : lst,
		lst_hms : KMG.Util.formatDegreesToHours(lst)
	};

};

KMG.Astro.geocentricToECI = function(date, lat, lon, alt) {

	var F = 0.0033528;
	var mfactor = 2 * Math.PI * (1.00273790934 / 86400.0); 

	theta = KMG.Astro.getGMST2(0.0, date.getJulianDay());
	theta = KMG.Math.clamp(theta + lon, 360) * KMG.PI_BY_180;
	
	
	lat *= KMG.PI_BY_180;
	lon *= KMG.PI_BY_180;
	
	var c = 1.0 / Math.sqrt(1.0 + (1.0 / 298.26) * (F - 2.0) * KMG.Math.sqr(Math.sin(lat)));   
	var s = KMG.Math.sqr(1.0 - F) * c;   
	var achcp = (KMG.AU_TO_KM * c + alt) * Math.cos(lat);   
	
	var x = achcp * Math.cos(theta);
	var y = achcp * Math.sin(theta);
	var z = (KMG.AU_TO_KM * s + alt) * Math.sin(lat);
	var w = Math.sqrt(x*x + y*y + z*z);
	
	return {
		x : x,
		y : y,
		z : z,
		w : w
	};
};


/** A work in progress
 *
 */
KMG.Astro.isSatelliteInSunlight = function(jd, satVecEci, sunVecEci) {
	if (!satVecEci || !satVecEci.x) {
		return;
	}
	
	var date = new KMG.AstroDate(undefined, jd);
	var sunPos = new THREE.Vector3(sunVecEci.x, sunVecEci.y, sunVecEci.z);
	var sat = new THREE.Vector3(satVecEci.x, satVecEci.y, satVecEci.z);
	sat.divideScalar(KMG.AU_TO_KM);
	earthPos = sat.negate();
	sat = new THREE.Vector3(0, 0, 0);

	sunPos.add(earthPos);

	var RE = 6378.135;
	var RS = 696342;
	var pE = sat.distanceTo(earthPos)* KMG.AU_TO_KM;
	var pS = sat.distanceTo(sunPos)* KMG.AU_TO_KM;
	var rS = earthPos.distanceTo(sunPos)* KMG.AU_TO_KM;

	var thetaE = Math.asin(RE / pE);
	var thetaS = Math.asin(RS / pS);
	
	var sunAngularSemiDiameter = thetaS * KMG._180_BY_PI;
	var earthAngularSemiDiameter = thetaE * KMG._180_BY_PI;
	

	earthPos.normalize();
	sunPos.normalize();
	sat.normalize();
	
	var dot = earthPos.dot(sunPos);
	var angleOfSeperation = sunPos.clone().sub(sat).angleTo(earthPos.clone().sub(sat));
	

	var theta = Math.acos(dot / (pE * pS));

	
	var isEclipsed = (angleOfSeperation * KMG._180_BY_PI < (earthAngularSemiDiameter - sunAngularSemiDiameter));
	
	if (isEclipsed) {
	//	return false;
	}
	
	
	// Umbral eclipse
	if (thetaE > thetaS && theta  < (thetaE - thetaS)) {
		isEclipsed = true;
	}
	
	// Penumbral eclipse
	if (Math.abs(thetaE - thetaS) < theta && theta < (thetaE + thetaS)) {
		isEclipsed = true;
	}
	
	// Annular eclipse
	if (thetaS > thetaE && theta < (thetaS - thetaE)) {
		isEclipsed = true;
	}
	
	//console.info([ dot, angleOfSeperation * KMG._180_BY_PI, earthAngularSemiDiameter, sunAngularSemiDiameter, isEclipsed]); 
	return !isEclipsed;

}