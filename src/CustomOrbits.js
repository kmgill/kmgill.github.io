/** Custom and Body-Specific Orbital Algorithms
 * http://www.apoapsys.com
 * 
 * Copyright 2014 Kevin M. Gill <kmsmgill@gmail.com>
 *
 * Uses algorithms from the VSOP87 theory for the orbits
 * of major planets.
 * ftp://ftp.bdl.fr/pub/ephem/planets/vsop87/
 * 
 * Code is also adapted from Celestia source
 * vsop87.cpp
 * customorbit.cpp
 * 
 * Uses algorithms from:
 * Meeus, Jean: Astronomical Algorithms.
 * Richmond, Virg.: Willmann-Bell, 2009.
 * ISBN: 978-0943396613
 * http://amzn.com/0943396611
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */


KMG.OrbitUtil = {};

KMG.OrbitUtil.anomaly = function(meanAnomaly, eccentricity)
{
    var e, delta, err;
    var tol = 0.00000001745;
    var iterations = 20;	// limit while() to maximum of 20 iterations.

    e = meanAnomaly - 2 * Math.PI *  Math.floor(meanAnomaly / (2*Math.PI));
    err = 1;
    while(Math.abs(err) > tol && iterations > 0)
    {
        err = e - eccentricity*Math.sin(e) - meanAnomaly;
        delta = err / (1 - eccentricity * Math.cos(e));
        e -= delta;
        iterations--;
    }

    var trueAnomaly = 2*Math.atan(Math.sqrt((1+eccentricity)/(1-eccentricity))*Math.tan(e/2));
    var eccentricAnomaly = e;
    
    
    return {
		trueAnomaly : trueAnomaly,
		eccentricAnomaly : eccentricAnomaly
	};
};

/**
 * Returns value in radians
 */
KMG.OrbitUtil.meanAnomalySun = function(t)
{
    var t2, a, b;

	t2 = t*  t;
	a = 9.999736042e1 * t;
	b = 360 * (a - Math.floor(a));

    return (3.5847583e2 - (1.5e-4 + 3.3e-6*t)*t2 + b) * KMG.PI_BY_180;
};






KMG.CustomMoonOrbit = function()
{
	KMG.Orbit.call( this );
	

	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.distance;
		
		
	}
	
	function degToRad(d) {
		return d * KMG.PI_BY_180;
	}
	
	function sin(v) {
		return Math.sin(v);
	}
	
	function cos(v) {
		return Math.cos(v);
	}
	
	// Adapted from Celestia: customorbit.cpp "LunarOrbit"
	function positionAtTime(jd) {

		
		var jd19, t, t2;
		var ld, ms, md, de, f, n, hp;
		var a, sa, sn, b, sb, c, sc, e, e2, l, g, w1, w2;
		var m1, m2, m3, m4, m5, m6;
        var eclLon, eclLat, horzPar, distance;
        var RA, dec;

        // Computation requires an abbreviated Julian day:
        // epoch January 0.5, 1900.
        jd19 = jd - 2415020.0;
		t = jd19/36525;
		t2 = t*t;

		m1 = jd19/27.32158213;
		m1 = 360.0*(m1-Math.floor(m1));
		m2 = jd19/365.2596407;
		m2 = 360.0*(m2-Math.floor(m2));
		m3 = jd19/27.55455094;
		m3 = 360.0*(m3-Math.floor(m3));
		m4 = jd19/29.53058868;
		m4 = 360.0*(m4-Math.floor(m4));
		m5 = jd19/27.21222039;
		m5 = 360.0*(m5-Math.floor(m5));
		m6 = jd19/6798.363307;
		m6 = 360.0*(m6-Math.floor(m6));

		ld = 270.434164+m1-(.001133-.0000019*t)*t2;
		ms = 358.475833+m2-(.00015+.0000033*t)*t2;
		md = 296.104608+m3+(.009192+.0000144*t)*t2;
		de = 350.737486+m4-(.001436-.0000019*t)*t2;
		f = 11.250889+m5-(.003211+.0000003*t)*t2;
		n = 259.183275-m6+(.002078+.000022*t)*t2;

		a = degToRad(51.2+20.2*t);
		sa = sin(a);
		sn = sin(degToRad(n));
		b = 346.56+(132.87-.0091731*t)*t;
		sb = .003964*sin(degToRad(b));
		c = degToRad(n+275.05-2.3*t);
		sc = sin(c);
		ld = ld+.000233*sa+sb+.001964*sn;
		ms = ms-.001778*sa;
		md = md+.000817*sa+sb+.002541*sn;
		f = f+sb-.024691*sn-.004328*sc;
		de = de+.002011*sa+sb+.001964*sn;
		e = 1-(.002495+7.52e-06*t)*t;
		e2 = e*e;

		ld = degToRad(ld);
		ms = degToRad(ms);
		n = degToRad(n);
		de = degToRad(de);
		f = degToRad(f);
		md = degToRad(md);

		l = 6.28875*sin(md)+1.27402*sin(2*de-md)+.658309*sin(2*de)+
			.213616*sin(2*md)-e*.185596*sin(ms)-.114336*sin(2*f)+
			.058793*sin(2*(de-md))+.057212*e*sin(2*de-ms-md)+
			.05332*sin(2*de+md)+.045874*e*sin(2*de-ms)+.041024*e*sin(md-ms);
		l = l-.034718*sin(de)-e*.030465*sin(ms+md)+.015326*sin(2*(de-f))-
			.012528*sin(2*f+md)-.01098*sin(2*f-md)+.010674*sin(4*de-md)+
			.010034*sin(3*md)+.008548*sin(4*de-2*md)-e*.00791*sin(ms-md+2*de)-
			e*.006783*sin(2*de+ms);
		l = l+.005162*sin(md-de)+e*.005*sin(ms+de)+.003862*sin(4*de)+
			e*.004049*sin(md-ms+2*de)+.003996*sin(2*(md+de))+
			.003665*sin(2*de-3*md)+e*.002695*sin(2*md-ms)+
			.002602*sin(md-2*(f+de))+e*.002396*sin(2*(de-md)-ms)-
			.002349*sin(md+de);
		l = l+e2*.002249*sin(2*(de-ms))-e*.002125*sin(2*md+ms)-
			e2*.002079*sin(2*ms)+e2*.002059*sin(2*(de-ms)-md)-
			.001773*sin(md+2*(de-f))-.001595*sin(2*(f+de))+
			e*.00122*sin(4*de-ms-md)-.00111*sin(2*(md+f))+.000892*sin(md-3*de);
		l = l-e*.000811*sin(ms+md+2*de)+e*.000761*sin(4*de-ms-2*md)+
				e2*.000704*sin(md-2*(ms+de))+e*.000693*sin(ms-2*(md-de))+
				e*.000598*sin(2*(de-f)-ms)+.00055*sin(md+4*de)+.000538*sin(4*md)+
				e*.000521*sin(4*de-ms)+.000486*sin(2*md-de);
		l = l+e2*.000717*sin(md-2*ms);
			eclLon = ld+degToRad(l);
			eclLon = KMG.Math.clamp(eclLon, 2 * Math.PI);

		g = 5.12819*sin(f)+.280606*sin(md+f)+.277693*sin(md-f)+
			.173238*sin(2*de-f)+.055413*sin(2*de+f-md)+.046272*sin(2*de-f-md)+
			.032573*sin(2*de+f)+.017198*sin(2*md+f)+.009267*sin(2*de+md-f)+
			.008823*sin(2*md-f)+e*.008247*sin(2*de-ms-f);
		g = g+.004323*sin(2*(de-md)-f)+.0042*sin(2*de+f+md)+
			e*.003372*sin(f-ms-2*de)+e*.002472*sin(2*de+f-ms-md)+
			e*.002222*sin(2*de+f-ms)+e*.002072*sin(2*de-f-ms-md)+
			e*.001877*sin(f-ms+md)+.001828*sin(4*de-f-md)-e*.001803*sin(f+ms)-
			.00175*sin(3*f);
		g = g+e*.00157*sin(md-ms-f)-.001487*sin(f+de)-e*.001481*sin(f+ms+md)+
				e*.001417*sin(f-ms-md)+e*.00135*sin(f-ms)+.00133*sin(f-de)+
				.001106*sin(f+3*md)+.00102*sin(4*de-f)+.000833*sin(f+4*de-md)+
				.000781*sin(md-3*f)+.00067*sin(f+4*de-2*md);
		g = g+.000606*sin(2*de-3*f)+.000597*sin(2*(de+md)-f)+
			e*.000492*sin(2*de+md-ms-f)+.00045*sin(2*(md-de)-f)+
			.000439*sin(3*md-f)+.000423*sin(f+2*(de+md))+
			.000422*sin(2*de-f-3*md)-e*.000367*sin(ms+f+2*de-md)-
			e*.000353*sin(ms+f+2*de)+.000331*sin(f+4*de);
		g = g+e*.000317*sin(2*de+f-ms+md)+e2*.000306*sin(2*(de-ms)-f)-
			.000283*sin(md+3*f);
		w1 = .0004664*cos(n);
		w2 = .0000754*cos(c);
		eclLat = degToRad(g)*(1-w1-w2);

		hp = .950724+.051818*cos(md)+.009531*cos(2*de-md)+.007843*cos(2*de)+
			 .002824*cos(2*md)+.000857*cos(2*de+md)+e*.000533*cos(2*de-ms)+
			 e*.000401*cos(2*de-md-ms)+e*.00032*cos(md-ms)-.000271*cos(de)-
			 e*.000264*cos(ms+md)-.000198*cos(2*f-md);
		hp = hp+.000173*cos(3*md)+.000167*cos(4*de-md)-e*.000111*cos(ms)+
			 .000103*cos(4*de-2*md)-.000084*cos(2*md-2*de)-
			 e*.000083*cos(2*de+ms)+.000079*cos(2*de+2*md)+.000072*cos(4*de)+
			 e*.000064*cos(2*de-ms+md)-e*.000063*cos(2*de+ms-md)+
			 e*.000041*cos(ms+de);
		hp = hp+e*.000035*cos(2*md-ms)-.000033*cos(3*md-2*de)-
			 .00003*cos(md+de)-.000029*cos(2*(f-de))-e*.000029*cos(2*md+ms)+
			 e2*.000026*cos(2*(de-ms))-.000023*cos(2*(f-de)+md)+
			 e*.000019*cos(4*de-ms-md);
		horzPar = degToRad(hp);
			
		
		distance = 6378.14 / sin(horzPar) / 149597870.700;
		//console.info("Distance: " + distance);
		// Finally convert eclLat, eclLon to RA, Dec.
        //EclipticToEquatorial(t, eclLat, eclLon, RA, dec);
		
		//var equatorial = KMG.Math.convertEclipticToEquatorial((jd - 2415020.0) / 36525.0, eclLat, eclLon);
		////var RA = equatorial.ra;
		//var dec = equatorial.dec;
		
		/*
		var RA = KMG.Math.clamp(eclLon, 2 * Math.PI);
		var dec = eclLat;
		
        // RA and Dec are referred to the equinox of date; we want to use
        // the J2000 equinox instead.  A better idea would be to directly
        // compute the position of the Moon in this coordinate system, but
        // this was easier.
        var converted = KMG.Math.epochConvert(jd, 2451545.0, RA, dec);
        RA = converted.ra;
        dec = converted.dec;
        
        //EpochConvert(jd, astro::J2000, RA, dec, RA, dec);

        // Corrections for internal coordinate system
        dec -= (Math.PI/2);
        RA += Math.PI;
		
        var pos = new THREE.Vector3(Math.cos(RA) * Math.sin(dec) * distance,
                       Math.cos(dec) * distance,
                       -Math.sin(RA) * Math.sin(dec) * distance);
		
		
		pos.distance = distance;
		return pos;
		*/
		
		var x = distance * Math.cos(eclLat) * Math.cos(eclLon);
        var y = distance * Math.cos(eclLat) * Math.sin(eclLon);
        var z = distance * Math.sin(eclLat);

        return new THREE.Vector3(x, z, -y);
		
		
	}
	

	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 27.321661,
		epoch : KMG.Util.julianNow()
	};
	
};
KMG.CustomMoonOrbit.prototype = Object.create( KMG.Orbit.prototype );







KMG.Jupiter = {};
KMG.Jupiter.radius = 71398.0;

KMG.Jupiter.computeElements = function(t) {
	
	var l1 = 106.07719 + 203.488955790 * t;
	var l2 = 175.73161 + 101.374724735 * t;
	var l3 = 120.55883 + 50.317609207 * t;
	var l4 = 84.44459 + 21.571071177 * t;
	
	var p1 = 97.0881 + 0.16138586 * t;
	var p2 = 154.8663 + 0.04726307 * t;
	var p3 = 188.1840 + 0.00712734 * t;
	var p4 = 335.2868 + 0.00184000 * t;
	
	var w1 = 312.3346 - 0.13279386 * t;
	var w2 = 100.4411 - 0.03263064 * t;
	var w3 = 119.1942 - 0.00717703 * t;
	var w4 = 322.6186 - 0.00175934 * t;
	
	// Principle inequality in the longitude of Jupiter
	var Γ = 0.33033 * KMG.Math.dsin(163.679 + 0.0010512 * t) + 0.03439 * KMG.Math.dsin(34.486 - 0.0161731 * t);
	
	// Phase of free libration
	var Φ = 199.6766 + 0.17379190 * t;
	
	// Longitude of the node of the equator of Jupiter on the ecliptic
	var Ψ = 316.5182 - 0.00000208 * t;
	
	// Mean anomalies of Jupiter and Saturn
	var G = 30.23756 + 0.0830925701 * t + Γ;
	var G_ = 31.97853 + 0.0334597339 * t;
	
	// Longitude of the perihelion of Jupiter
	var Π = 13.469942;
	
	return {
		l1 : l1,
		l2 : l2,
		l3 : l3,
		l4 : l4,
		
		p1 : p1,
		p2 : p2,
		p3 : p3,
		p4 : p4,
		
		w1 : w1,
		w2 : w2,
		w3 : w3,
		w4 : w4,
		
		Γ : Γ,
		Φ : Φ,
		Ψ : Ψ,
		G : G,
		G_ : G_,
		Π : Π
		
	};
	
	
};




KMG.CustomIoOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	function degToRad(v) {
		return v * KMG.PI_BY_180;
	}
	
	function positionAtTime(jd) {
		//var t = (jd - 2451545) / 36525;
		var t = jd - 2443000.5;
		//var t = (jd - 2443000.5) / 36525;
		var e = KMG.Jupiter.computeElements(t);
		
		var LPEJ = e.Π;
		
		// Calculate periodic terms for longitude
		var Σ1 = 0.47259*KMG.Math.dsin(2*(e.l1 - e.l2)) - 0.03478*KMG.Math.dsin(e.p3 - e.p4)
				+ 0.01081*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p3) + 7.38e-3*KMG.Math.dsin(e.Φ)
				+ 7.13e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p2) - 6.74e-3*KMG.Math.dsin(e.p1 + e.p3 - 2*LPEJ - 2*e.G)
				+ 6.66e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p4) + 4.45e-3*KMG.Math.dsin(e.l1 - e.p3)
				- 3.54e-3*KMG.Math.dsin(e.l1 - e.l2) - 3.17e-3*KMG.Math.dsin(2*(e.Ψ - LPEJ))
				+ 2.65e-3*KMG.Math.dsin(e.l1 - e.p4) - 1.86e-3*KMG.Math.dsin(e.G)
				+ 1.62e-3*KMG.Math.dsin(e.p2 - e.p3) + 1.58e-3*KMG.Math.dsin(4*(e.l1 - e.l2))
				- 1.55e-3*KMG.Math.dsin(e.l1 - e.l3) - 1.38e-3*KMG.Math.dsin(e.Ψ + e.w3 - 2*LPEJ - 2*e.G)
				- 1.15e-3*KMG.Math.dsin(2*(e.l1 - 2*e.l2 + e.w2)) + 8.9e-4*KMG.Math.dsin(e.p2 - e.p4)
				+ 8.5e-4*KMG.Math.dsin(e.l1 + e.p3 - 2*LPEJ - 2*e.G) + 8.3e-4*KMG.Math.dsin(e.w2 - e.w3)
				+ 5.3e-4*KMG.Math.dsin(e.Ψ - e.w2);
		Σ1 = KMG.Math.clamp(Σ1, 360.0);
		//Σ1 = degToRad(Σ1);
		var L = e.l1 + Σ1;

		// Calculate periodic terms for the tangent of the latitude
		var B = 6.393e-4*KMG.Math.dsin(L - e.w1) + 1.825e-4*KMG.Math.dsin(L - e.w2)
			+ 3.29e-5*KMG.Math.dsin(L - e.w3) - 3.11e-5*KMG.Math.dsin(L - e.Ψ)
			+ 9.3e-6*KMG.Math.dsin(L - e.w4) + 7.5e-6*KMG.Math.dsin(3*L - 4*e.l2 - 1.9927*Σ1 + e.w2)
			+ 4.6e-6*KMG.Math.dsin(L + e.Ψ - 2*LPEJ - 2*e.G);
		B = KMG.Math.datan(B);

		// Calculate the periodic terms for distance
		var R = -4.1339e-3*KMG.Math.dcos(2*(e.l1 - e.l2)) - 3.87e-5*KMG.Math.dcos(e.l1 - e.p3)
		  - 2.14e-5*KMG.Math.dcos(e.l1 - e.p4) + 1.7e-5*KMG.Math.dcos(e.l1 - e.l2)
		  - 1.31e-5*KMG.Math.dcos(4*(e.l1 - e.l2)) + 1.06e-5*KMG.Math.dcos(e.l1 - e.l3)
		  - 6.6e-6*KMG.Math.dcos(e.l1 + e.p3 - 2*LPEJ - 2*e.G);
		R = 5.90569 * KMG.Jupiter.radius * (1 + R) / KMG.AU_TO_KM;

		var T = (jd - 2433282.423) / 36525.0;
		var P = 1.3966626*T + 3.088e-4*T*T;
		L += P;

		//L += 22.203;
	
		
		L = L * KMG.PI_BY_180;
		B = B * KMG.PI_BY_180;
		
		B -= Math.PI / 2;
        L += Math.PI;
		
		var x = Math.cos(L) * Math.sin(B) * R;
		var y = Math.cos(B) * R;
		var z = -Math.sin(L) * Math.sin(B) * R;

		var position = new THREE.Vector3(x, y, z);
		position.l = L;
		position.b = B;
		position.r = R;
		return position;
	}
	

	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 1.769138,
		epoch : KMG.Util.julianNow()
	};
	
};
KMG.CustomIoOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomEuropaOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	function degToRad(v) {
		return v * KMG.PI_BY_180;
	}
	
	function positionAtTime(jd) {
		//var t = (jd - 2451545) / 36525;
		var t = (jd - 2443000.5);// / 36525;
		var e = KMG.Jupiter.computeElements(t);
		
		var LPEJ = e.Π;
		
		
		// Calculate periodic terms for lone.Gitude
		var Σ1 = 1.06476*KMG.Math.dsin(2*(e.l2 - e.l3)) + 0.04256*KMG.Math.dsin(e.l1 - 2*e.l2 + e.p3)
			  + 0.03581*KMG.Math.dsin(e.l2 - e.p3) + 0.02395*KMG.Math.dsin(e.l1 - 2*e.l2 + e.p4)
			  + 0.01984*KMG.Math.dsin(e.l2 - e.p4) - 0.01778*KMG.Math.dsin(e.Φ)
			  + 0.01654*KMG.Math.dsin(e.l2 - e.p2) + 0.01334*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p2)
			  + 0.01294*KMG.Math.dsin(e.p3 - e.p4) - 0.01142*KMG.Math.dsin(e.l2 - e.l3)
			  - 0.01057*KMG.Math.dsin(e.G) - 7.75e-3*KMG.Math.dsin(2*(e.Ψ - LPEJ))
			  + 5.24e-3*KMG.Math.dsin(2*(e.l1 - e.l2)) - 4.6e-3*KMG.Math.dsin(e.l1 - e.l3)
			  + 3.16e-3*KMG.Math.dsin(e.Ψ - 2*e.G + e.w3 - 2*LPEJ) - 2.03e-3*KMG.Math.dsin(e.p1 + e.p3 - 2*LPEJ - 2*e.G)
			  + 1.46e-3*KMG.Math.dsin(e.Ψ - e.w3) - 1.45e-3*KMG.Math.dsin(2*e.G)
			  + 1.25e-3*KMG.Math.dsin(e.Ψ - e.w4) - 1.15e-3*KMG.Math.dsin(e.l1 - 2*e.l3 + e.p3)
			  - 9.4e-4*KMG.Math.dsin(2*(e.l2 - e.w2)) + 8.6e-4*KMG.Math.dsin(2*(e.l1 - 2*e.l2 + e.w2))
			  - 8.6e-4*KMG.Math.dsin(5*e.G_ - 2*e.G + 0.9115) - 7.8e-4*KMG.Math.dsin(e.l2 - e.l4)
			  - 6.4e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 4*e.p4) + 6.4e-4*KMG.Math.dsin(e.p1 - e.p4)
			  - 6.3e-4*KMG.Math.dsin(e.l1 - 2*e.l3 + e.p4) + 5.8e-4*KMG.Math.dsin(e.w3 - e.w4)
			  + 5.6e-4*KMG.Math.dsin(2*(e.Ψ - LPEJ - e.G)) + 5.6e-4*KMG.Math.dsin(2*(e.l2 - e.l4))
			  + 5.5e-4*KMG.Math.dsin(2*(e.l1 - e.l3)) + 5.2e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + e.p3 +3*e.p4)
			  - 4.3e-4*KMG.Math.dsin(e.l1 - e.p3) + 4.1e-4*KMG.Math.dsin(5*(e.l2 - e.l3))
			  + 4.1e-4*KMG.Math.dsin(e.p4 - LPEJ) + 3.2e-4*KMG.Math.dsin(e.w2 - e.w3)
			  + 3.2e-4*KMG.Math.dsin(2*(e.l3 - e.G - LPEJ));
		Σ1 = KMG.Math.clamp(Σ1, 360.0);
		//Σ1 = dee.GToRad(Σ1);
		var L = e.l2 + Σ1;

		// Calculate periodic terms for the tane.Gent of the latitude
		var B = 8.1004e-3*KMG.Math.dsin(L - e.w2) + 4.512e-4*KMG.Math.dsin(L - e.w3)
		  - 3.284e-4*KMG.Math.dsin(L - e.Ψ) + 1.160e-4*KMG.Math.dsin(L - e.w4)
		  + 2.72e-5*KMG.Math.dsin(e.l1 - 2*e.l3 + 1.0146*Σ1 + e.w2) - 1.44e-5*KMG.Math.dsin(L - e.w1)
		  + 1.43e-5*KMG.Math.dsin(L + e.Ψ - 2*LPEJ - 2*e.G) + 3.5e-6*KMG.Math.dsin(L - e.Ψ + e.G)
		  - 2.8e-6*KMG.Math.dsin(e.l1 - 2*e.l3 + 1.0146*Σ1 + e.w3);
		B = KMG.Math.datan(B);

		// Calculate the periodic terms for distance
		var R = 9.3848e-3*KMG.Math.dcos(e.l1 - e.l2) - 3.116e-4*KMG.Math.dcos(e.l2 - e.p3)
		  - 1.744e-4*KMG.Math.dcos(e.l2 - e.p4) - 1.442e-4*KMG.Math.dcos(e.l2 - e.p2)
		  + 5.53e-5*KMG.Math.dcos(e.l2 - e.l3) + 5.23e-5*KMG.Math.dcos(e.l1 - e.l3)
		  - 2.9e-5*KMG.Math.dcos(2*(e.l1 - e.l2)) + 1.64e-5*KMG.Math.dcos(2*(e.l2 - e.w2))
		  + 1.07e-5*KMG.Math.dcos(e.l1 - 2*e.l3 + e.p3) - 1.02e-5*KMG.Math.dcos(e.l2 - e.p1)
		  - 9.1e-6*KMG.Math.dcos(2*(e.l1 - e.l3));
		R = 9.39657 * KMG.Jupiter.radius * (1 + R) / KMG.AU_TO_KM;

		var T = (jd - 2433282.423) / 36525.0;
		var P = 1.3966626*T + 3.088e-4*T*T;
		L += P;
		//L += dee.GToRad(P);
		//L += 22.203;
		
		
		//console.info([L, B, R]);
		
		L = L * KMG.PI_BY_180;
		B = B * KMG.PI_BY_180;
		
		B -= Math.PI / 2;
        L += Math.PI;
                   
		var x = Math.cos(L) * Math.sin(B) * R;
		var y = Math.cos(B) * R;
		var z = -Math.sin(L) * Math.sin(B) * R;

		var position = new THREE.Vector3(x, y, z);
		position.l = L;
		position.b = B;
		position.r = R;
		return position;
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 3.5511810791,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomEuropaOrbit.prototype = Object.create( KMG.Orbit.prototype );





KMG.CustomGanymedeOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	function degToRad(v) {
		return v * KMG.PI_BY_180;
	}
	
	function positionAtTime(jd) {
		//var t = (jd - 2451545) / 36525;
		var t = (jd - 2443000.5);// / 36525;
		var e = KMG.Jupiter.computeElements(t);
		
		var LPEJ = e.Π;
		var psi = e.Ψ;
		var phi = e.Φ;

		  
		  
		//Calculate periodic terms for lone.Gitude
		var Σ1 = 0.1649*KMG.Math.dsin(e.l3 - e.p3) + 0.09081*KMG.Math.dsin(e.l3 - e.p4)
			  - 0.06907*KMG.Math.dsin(e.l2 - e.l3) + 0.03784*KMG.Math.dsin(e.p3 - e.p4)
			  + 0.01846*KMG.Math.dsin(2*(e.l3 - e.l4)) - 0.01340*KMG.Math.dsin(e.G)
			  - 0.01014*KMG.Math.dsin(2*(psi - LPEJ)) + 7.04e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p3)
			  - 6.2e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p2) - 5.41e-3*KMG.Math.dsin(e.l3 - e.l4)
			  + 3.81e-3*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p4) + 2.35e-3*KMG.Math.dsin(psi - e.w3)
			  + 1.98e-3*KMG.Math.dsin(psi - e.w4) + 1.76e-3*KMG.Math.dsin(phi)
			  + 1.3e-3*KMG.Math.dsin(3*(e.l3 - e.l4)) + 1.25e-3*KMG.Math.dsin(e.l1 - e.l3)
			  - 1.19e-3*KMG.Math.dsin(5*e.G_ - 2*e.G + 0.9115) + 1.09e-3*KMG.Math.dsin(e.l1 - e.l2)
			  - 1.0e-3*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 4*e.p4) + 9.1e-4*KMG.Math.dsin(e.w3 - e.w4)
			  + 8.0e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + e.p3 + 3*e.p4) - 7.5e-4*KMG.Math.dsin(2*e.l2 - 3*e.l3 + e.p3)
			  + 7.2e-4*KMG.Math.dsin(e.p1 + e.p3 - 2*LPEJ - 2*e.G) + 6.9e-4*KMG.Math.dsin(e.p4 - LPEJ)
			  - 5.8e-4*KMG.Math.dsin(2*e.l3 - 3*e.l4 + e.p4) - 5.7e-4*KMG.Math.dsin(e.l3 - 2*e.l4 + e.p4)
			  + 5.6e-4*KMG.Math.dsin(e.l3 + e.p3 - 2*LPEJ - 2*e.G) - 5.2e-4*KMG.Math.dsin(e.l2 - 2*e.l3 + e.p1)
			  - 5.0e-4*KMG.Math.dsin(e.p2 - e.p3) + 4.8e-4*KMG.Math.dsin(e.l3 - 2*e.l4 + e.p3)
			  - 4.5e-4*KMG.Math.dsin(2*e.l2 - 3*e.l3 + e.p4) - 4.1e-4*KMG.Math.dsin(e.p2 - e.p4)
			  - 3.8e-4*KMG.Math.dsin(2*e.G) - 3.7e-4*KMG.Math.dsin(e.p3 - e.p4 + e.w3 - e.w4)
			  - 3.2e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 2*e.p3 + 2*e.p4) + 3.0e-4*KMG.Math.dsin(4*(e.l3 - e.l4))
			  + 2.9e-4*KMG.Math.dsin(e.l3 + e.p4 - 2*LPEJ - 2*e.G) - 2.8e-4*KMG.Math.dsin(e.w3 + psi - 2*LPEJ - 2*e.G)
			  + 2.6e-4*KMG.Math.dsin(e.l3 - LPEJ - e.G) + 2.4e-4*KMG.Math.dsin(e.l2 - 3*e.l3 + 2*e.l4)
			  + 2.1e-4*KMG.Math.dsin(2*(e.l3 - LPEJ - e.G)) - 2.1e-4*KMG.Math.dsin(e.l3 - e.p2)
			  + 1.7e-4*KMG.Math.dsin(e.l3 - e.p3);
		Σ1 = KMG.Math.clamp(Σ1, 360.0);
		//sie.Gma = dee.GToRad(sie.Gma);
		var L = e.l3 + Σ1;

		//Calculate periodic terms for the tane.Gent of the latitude
		var B = 3.2402e-3*KMG.Math.dsin(L - e.w3) - 1.6911e-3*KMG.Math.dsin(L - psi)
		  + 6.847e-4*KMG.Math.dsin(L - e.w4) - 2.797e-4*KMG.Math.dsin(L - e.w2)
		  + 3.21e-5*KMG.Math.dsin(L + psi - 2*LPEJ - 2*e.G) + 5.1e-6*KMG.Math.dsin(L - psi + e.G)
		  - 4.5e-6*KMG.Math.dsin(L - psi - e.G) - 4.5e-6*KMG.Math.dsin(L + psi - 2*LPEJ)
		  + 3.7e-6*KMG.Math.dsin(L + psi - 2*LPEJ - 3*e.G) + 3.0e-6*KMG.Math.dsin(2*e.l2 - 3*L + 4.03*Σ1 + e.w2)
		  - 2.1e-6*KMG.Math.dsin(2*e.l2 - 3*L + 4.03*Σ1 + e.w3);
		B = KMG.Math.datan(B);

		//Calculate the periodic terms for distance
		var R = -1.4388e-3*KMG.Math.dcos(e.l3 - e.p3) - 7.919e-4*KMG.Math.dcos(e.l3 - e.p4)
		  + 6.342e-4*KMG.Math.dcos(e.l2 - e.l3) - 1.761e-4*KMG.Math.dcos(2*(e.l3 - e.l4))
		  + 2.94e-5*KMG.Math.dcos(e.l3 - e.l4) - 1.56e-5*KMG.Math.dcos(3*(e.l3 - e.l4))
		  + 1.56e-5*KMG.Math.dcos(e.l1 - e.l3) - 1.53e-5*KMG.Math.dcos(e.l1 - e.l2)
		  + 7.0e-6*KMG.Math.dcos(2*e.l2 - 3*e.l3 + e.p3) - 5.1e-6*KMG.Math.dcos(e.l3 + e.p3 - 2*LPEJ - 2*e.G);
		R = 14.98832 * KMG.Jupiter.radius * (1 + R) / KMG.AU_TO_KM;
		
		var T = (jd - 2433282.423) / 36525.0;
		var P = 1.3966626*T + 3.088e-4*T*T;
		L += P;
		//L += dee.GToRad(P);

		//L += JupAscendingNode;
		  
		
		//console.info([L, B, R]);
		
		L = L * KMG.PI_BY_180;
		B = B * KMG.PI_BY_180;
		
		B -= Math.PI / 2;
        L += Math.PI;
                   
		var x = Math.cos(L) * Math.sin(B) * R;
		var y = Math.cos(B) * R;
		var z = -Math.sin(L) * Math.sin(B) * R;

		var position = new THREE.Vector3(x, y, z);
		position.l = L;
		position.b = B;
		position.r = R;
		return position;
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 3.5511810791,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomGanymedeOrbit.prototype = Object.create( KMG.Orbit.prototype );




KMG.CustomCallistoOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	}
	
	function degToRad(v) {
		return v * KMG.PI_BY_180;
	}
	
	function positionAtTime(jd) {
		//var t = (jd - 2451545) / 36525;
		var t = (jd - 2443000.5);// / 36525;
		var e = KMG.Jupiter.computeElements(t);
		
		var LPEJ = e.Π;
		var psi = e.Ψ;
		var phi = e.Φ;

		  
		  
		//Calculate periodic terms for lone.Gitude
		var Σ1 =
			0.84287*KMG.Math.dsin(e.l4 - e.p4)
			+ 0.03431*KMG.Math.dsin(e.p4 - e.p3)
			- 0.03305*KMG.Math.dsin(2*(psi - LPEJ))
			- 0.03211*KMG.Math.dsin(e.G)
			- 0.01862*KMG.Math.dsin(e.l4 - e.p3)
			+ 0.01186*KMG.Math.dsin(psi - e.w4)
			+ 6.23e-3*KMG.Math.dsin(e.l4 + e.p4 - 2*e.G - 2*LPEJ)
			+ 3.87e-3*KMG.Math.dsin(2*(e.l4 - e.p4))
			- 2.84e-3*KMG.Math.dsin(5*e.G_ - 2*e.G + 0.9115)
			- 2.34e-3*KMG.Math.dsin(2*(psi - e.p4))
			- 2.23e-3*KMG.Math.dsin(e.l3 - e.l4)
			- 2.08e-3*KMG.Math.dsin(e.l4 - LPEJ)
			+ 1.78e-3*KMG.Math.dsin(psi + e.w4 - 2*e.p4)
			+ 1.34e-3*KMG.Math.dsin(e.p4 - LPEJ)
			+ 1.25e-3*KMG.Math.dsin(2*(e.l4 - e.G - LPEJ))
			- 1.17e-3*KMG.Math.dsin(2*e.G)
			- 1.12e-3*KMG.Math.dsin(2*(e.l3 - e.l4))
			+ 1.07e-3*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 4*e.p4)
			+ 1.02e-3*KMG.Math.dsin(e.l4 - e.G - LPEJ)
			+ 9.6e-4*KMG.Math.dsin(2*e.l4 - psi - e.w4)
			+ 8.7e-4*KMG.Math.dsin(2*(psi - e.w4))
			- 8.5e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + e.p3 + 3*e.p4)
			+ 8.5e-4*KMG.Math.dsin(e.l3 - 2*e.l4 + e.p4)
			- 8.1e-4*KMG.Math.dsin(2*(e.l4 - psi))
			+ 7.1e-4*KMG.Math.dsin(e.l4 + e.p4 - 2*LPEJ - 3*e.G)
			+ 6.1e-4*KMG.Math.dsin(e.l1 - e.l4)
			- 5.6e-4*KMG.Math.dsin(psi - e.w3)
			- 5.4e-4*KMG.Math.dsin(e.l3 - 2*e.l4 + e.p3)
			+ 5.1e-4*KMG.Math.dsin(e.l2 - e.l4)
			+ 4.2e-4*KMG.Math.dsin(2*(psi - e.G - LPEJ))
			+ 3.9e-4*KMG.Math.dsin(2*(e.p4 - e.w4))
			+ 3.6e-4*KMG.Math.dsin(psi + LPEJ - e.p4 - e.w4)
			+ 3.5e-4*KMG.Math.dsin(2*e.G_ - e.G + 3.2877)
			- 3.5e-4*KMG.Math.dsin(e.l4 - e.p4 + 2*LPEJ - 2*psi)
			- 3.2e-4*KMG.Math.dsin(e.l4 + e.p4 - 2*LPEJ - e.G)
			+ 3.0e-4*KMG.Math.dsin(2*e.G_ - 2*e.G + 2.6032)
			+ 2.9e-4*KMG.Math.dsin(3*e.l3 - 7*e.l4 + 2*e.p3 + 2*e.p4)
			+ 2.8e-4*KMG.Math.dsin(e.l4 - e.p4 + 2*psi - 2*LPEJ)
			- 2.8e-4*KMG.Math.dsin(2*(e.l4 - e.w4))
			- 2.7e-4*KMG.Math.dsin(e.p3 - e.p4 + e.w3 - e.w4)
			- 2.6e-4*KMG.Math.dsin(5*e.G_ - 3*e.G + 3.2877)
			+ 2.5e-4*KMG.Math.dsin(e.w4 - e.w3)
			- 2.5e-4*KMG.Math.dsin(e.l2 - 3*e.l3 + 2*e.l4)
			- 2.3e-4*KMG.Math.dsin(3*(e.l3 - e.l4))
			+ 2.1e-4*KMG.Math.dsin(2*e.l4 - 2*LPEJ - 3*e.G)
			- 2.1e-4*KMG.Math.dsin(2*e.l3 - 3*e.l4 + e.p4)
			+ 1.9e-4*KMG.Math.dsin(e.l4 - e.p4 - e.G)
			- 1.9e-4*KMG.Math.dsin(2*e.l4 - e.p3 - e.p4)
			- 1.8e-4*KMG.Math.dsin(e.l4 - e.p4 + e.G)
			- 1.6e-4*KMG.Math.dsin(e.l4 + e.p3 - 2*LPEJ - 2*e.G);
		Σ1 = KMG.Math.clamp(Σ1, 360.0);
		//Σ1 = dee.GToRad(Σ1);
		var L = e.l4 + Σ1;

		//Calculate periodic terms for the tane.Gent of the latitude
		var B =
			- 7.6579e-3 * KMG.Math.dsin(L - psi)
			+ 4.4134e-3 * KMG.Math.dsin(L - e.w4)
			- 5.112e-4  * KMG.Math.dsin(L - e.w3)
			+ 7.73e-5   * KMG.Math.dsin(L + psi - 2*LPEJ - 2*e.G)
			+ 1.04e-5   * KMG.Math.dsin(L - psi + e.G)
			- 1.02e-5   * KMG.Math.dsin(L - psi - e.G)
			+ 8.8e-6    * KMG.Math.dsin(L + psi - 2*LPEJ - 3*e.G)
			- 3.8e-6    * KMG.Math.dsin(L + psi - 2*LPEJ - e.G);
		B = KMG.Math.datan(B);

		//Calculate the periodic terms for distance
		var R =
			- 7.3546e-3 * KMG.Math.dcos(e.l4 - e.p4)
			+ 1.621e-4  * KMG.Math.dcos(e.l4 - e.p3)
			+ 9.74e-5   * KMG.Math.dcos(e.l3 - e.l4)
			- 5.43e-5   * KMG.Math.dcos(e.l4 + e.p4 - 2*LPEJ - 2*e.G)
			- 2.71e-5   * KMG.Math.dcos(2*(e.l4 - e.p4))
			+ 1.82e-5   * KMG.Math.dcos(e.l4 - LPEJ)
			+ 1.77e-5   * KMG.Math.dcos(2*(e.l3 - e.l4))
			- 1.67e-5   * KMG.Math.dcos(2*e.l4 - psi - e.w4)
			+ 1.67e-5   * KMG.Math.dcos(psi - e.w4)
			- 1.55e-5   * KMG.Math.dcos(2*(e.l4 - LPEJ - e.G))
			+ 1.42e-5   * KMG.Math.dcos(2*(e.l4 - psi))
			+ 1.05e-5   * KMG.Math.dcos(e.l1 - e.l4)
			+ 9.2e-6    * KMG.Math.dcos(e.l2 - e.l4)
			- 8.9e-6    * KMG.Math.dcos(e.l4 - LPEJ -e.G)
			- 6.2e-6    * KMG.Math.dcos(e.l4 + e.p4 - 2*LPEJ - 3*e.G)
			+ 4.8e-6    * KMG.Math.dcos(2*(e.l4 - e.w4));

		R = 26.36273 * KMG.Jupiter.radius * (1 + R) / KMG.AU_TO_KM;
		var T = (jd - 2433282.423) / 36525.0;
		var P = 1.3966626*T + 3.088e-4*T*T;
		L += P;
		//L += degToRad(P);

		//L += JupAscendingNode;
		  
		
		//console.info([L, B, R]);
		
		L = L * KMG.PI_BY_180;
		B = B * KMG.PI_BY_180;
		
		B -= Math.PI / 2;
        L += Math.PI;
                   
		var x = Math.cos(L) * Math.sin(B) * R;
		var y = Math.cos(B) * R;
		var z = -Math.sin(L) * Math.sin(B) * R;

		var position = new THREE.Vector3(x, y, z);
		position.l = L;
		position.b = B;
		position.r = R;
		return position;
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 3.5511810791,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomCallistoOrbit.prototype = Object.create( KMG.Orbit.prototype );





KMG.Saturn = {};
KMG.Saturn.radius = 60330.0;
KMG.Saturn.ascendingNode = 168.8112;
KMG.Saturn.tilt = 28.0817;

KMG.Saturn.computeSaturnElements = function(t) {
	
	
};


KMG.Saturn.saturnMoonPosition = function(lam, gam, Om, r) {
	
	
};


KMG.CustomMimasOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomMimasOrbit.prototype = Object.create( KMG.Orbit.prototype );
	
	

KMG.CustomEnceladusOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomEnceladusOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomTethysOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomTethysOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomDioneOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomDioneOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomRheaOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomRheaOrbit.prototype = Object.create( KMG.Orbit.prototype );


KMG.CustomTitanOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 15.94544758,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomTitanOrbit.prototype = Object.create( KMG.Orbit.prototype );
	
	
	
	
	

KMG.CustomHyperionOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomHyperionOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomIapetusOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomIapetusOrbit.prototype = Object.create( KMG.Orbit.prototype );



KMG.CustomPhoebeOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomPhoebeOrbit.prototype = Object.create( KMG.Orbit.prototype );







// ftp://ftp.imcce.fr/pub/ephem/planets/pluto95/pluto.doc
KMG.CustomPlutoOrbit = function() {
	KMG.Orbit.call( this );
	
	function distanceAtTime(jd) {
		var pos = positionAtTime(jd);
		return pos.r;
	};
	
	
	function positionAtTime(jd) {
		
	};
	
	return {
		positionAtTime : positionAtTime,
		distanceAtTime : distanceAtTime,
		period : 0,
		epoch : KMG.Util.julianNow()
	};
	
	
};
KMG.CustomPlutoOrbit.prototype = Object.create( KMG.Orbit.prototype );





KMG.CustomOrbits = {};

KMG.CustomOrbits.sun = function() {
	return new KMG.VSOP87OrbitRect(KMG.VSOPSeries.sun_X, KMG.VSOPSeries.sun_Y, KMG.VSOPSeries.sun_Z, 0);
};

KMG.CustomOrbits.mercury = function() {
	return new KMG.VSOP87Orbit(KMG.VSOPSeries.mercury_L, KMG.VSOPSeries.mercury_B, KMG.VSOPSeries.mercury_R, 87.9522);
};

KMG.CustomOrbits.venus = function() {
	return new KMG.VSOP87Orbit(KMG.VSOPSeries.venus_L, KMG.VSOPSeries.venus_B, KMG.VSOPSeries.venus_R, 224.7018);
};

KMG.CustomOrbits.earth = function() {
	return new KMG.VSOP87Orbit(KMG.VSOPSeries.earth_L, KMG.VSOPSeries.earth_B, KMG.VSOPSeries.earth_R, 365.25);
};

KMG.CustomOrbits.moon = function() {
	return new KMG.CustomMoonOrbit();
};

KMG.CustomOrbits.mars = function() {
	return new KMG.VSOP87Orbit(KMG.VSOPSeries.mars_L, KMG.VSOPSeries.mars_B, KMG.VSOPSeries.mars_R, 689.998725);
};

KMG.CustomOrbits.ceres = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.ceres);
};

KMG.CustomOrbits.vesta = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.vesta);
};

KMG.CustomOrbits.jupiter = function() {
	return new KMG.VSOP87Orbit(KMG.VSOPSeries.jupiter_L, KMG.VSOPSeries.jupiter_B, KMG.VSOPSeries.jupiter_R, 4332.66855);
};

KMG.CustomOrbits.ganymede = function() {
	return new KMG.CustomGanymedeOrbit();
};

KMG.CustomOrbits.io = function() {
	return new KMG.CustomIoOrbit();
};

KMG.CustomOrbits.callisto = function() {
	return new KMG.CustomCallistoOrbit();
};

KMG.CustomOrbits.europa = function() {
	return new KMG.CustomEuropaOrbit();
};



KMG.CustomOrbits.saturn = function() {
	return new KMG.VSOP87Orbit(KMG.VSOPSeries.saturn_L, KMG.VSOPSeries.saturn_B, KMG.VSOPSeries.saturn_R, 10759.42493);
};

KMG.CustomOrbits.titan = function() {
	//return new KMG.CustomTitanOrbit();
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.titan);
};

KMG.CustomOrbits.uranus = function() {
	return new KMG.VSOP87Orbit(KMG.VSOPSeries.uranus_L, KMG.VSOPSeries.uranus_B, KMG.VSOPSeries.uranus_R, 30686.07698);
};

KMG.CustomOrbits.neptune = function() {
	return new KMG.VSOP87Orbit(KMG.VSOPSeries.neptune_L, KMG.VSOPSeries.neptune_B, KMG.VSOPSeries.neptune_R, 60190.64325);
};

KMG.CustomOrbits.pluto = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.pluto);
};

KMG.CustomOrbits.sedna = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.sedna);
};

KMG.CustomOrbits.makemake = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.makemake);
};

KMG.CustomOrbits.haumea = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.haumea);
};

KMG.CustomOrbits.eris = function() {
	return new KMG.EllipticalOrbit(KMG.OrbitDefinitions.eris);
};






KMG.CustomOrbitProxy = function(orbit)
{
	KMG.Orbit.call( this );
	
	return {
		positionAtTime : orbit.positionAtTime,
		distanceAtTime : orbit.distanceAtTime,
		period : orbit.period,
		epoch : orbit.epoch
	};
	
};
KMG.CustomOrbitProxy.prototype = Object.create( KMG.Orbit.prototype );


KMG.CustomSunOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.sun() );
};

KMG.CustomMercuryOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.mercury() );
};

KMG.CustomVenusOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.venus() );
};

KMG.CustomEarthOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.earth() );
};

KMG.CustomMarsOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.mars() );
};

KMG.CustomJupiterOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.jupiter() );
};


KMG.CustomSaturnOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.saturn() );
};

KMG.CustomUranusOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.uranus() );
};

KMG.CustomNeptuneOrbit = function()
{
	return KMG.CustomOrbitProxy.call( this, KMG.CustomOrbits.neptune() );
};
