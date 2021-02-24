/** IAU Rotational Elements
 * Lunar Algorithms
 * http://www.apoapsys.com
 * 
 * Copyright 2014 Kevin M. Gill <kmsmgill@gmail.com>
 *
 * Uses algorithms from:
 * Report of the IAU Working Group on Cartographic Coordinates and Rotational Elements: 2009
 * http://astrogeology.usgs.gov/groups/iau-wgccre
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */




KMG.IAU_SECULAR_TERM_VALID_CENTURIES = 50.0;
KMG.P03LP_VALID_CENTURIES = 5000.0;

KMG.IAURotation = function() {

	var scope = this;
	
	function clampCenturies(t) {
        if (t < -KMG.IAU_SECULAR_TERM_VALID_CENTURIES)
            t = -KMG.IAU_SECULAR_TERM_VALID_CENTURIES;
        else if (t > KMG.IAU_SECULAR_TERM_VALID_CENTURIES)
            t = KMG.IAU_SECULAR_TERM_VALID_CENTURIES;
		return t;
    };
	
	this.julianCentury = function(jd) {
		return (jd - 2451545.0) / 36525.0;
	}
	
	// T = Julian Centuries of 36525 days from epoch
	// d = Julian Days from epoch
	this.calculateOrientation = function(jd) {
		var t = this.julianCentury(jd);
		t = clampCenturies(t);
		jd = jd - 2451545.0;
		
		var result = this.__calculateOrientation(jd, t);
		var ra = result.ra;
		var dec = result.dec;
		
		var node = ra + 90.0;
        var inclination = 90.0 - dec;

		return {
			ra : ra,
			dec : dec,
			node : node,
			inclination : inclination
		};
	
	};
	
	// T = Julian Centuries of 36525 days from epoch
	// d = Julian Days from epoch
	this.computeSiderealRotation = function(jd) {
		var t = this.julianCentury(jd);
		jd = jd - 2451545.0;

		return {
			meridian : this.__computeSiderealRotation(jd, t).meridian
		};
		
	};
	
	this.computeRotationalQuaternion = function(jd, skipMeridian) {
	
		var orientation = this.calculateOrientation(jd);
		var meridian = KMG.Math.clamp(this.computeSiderealRotation(jd).meridian, 360) + 90;
		var nodeAxis = new THREE.Vector3( 1, 0, 0 );
		nodeAxis.rotateY((-orientation.node + 90) * KMG.PI_BY_180);
		
		var inclinationQ = new THREE.Quaternion();
		inclinationQ.setFromAxisAngle( nodeAxis, -orientation.inclination * KMG.PI_BY_180 );
	
		var noMeridian = inclinationQ.clone();
		if (!skipMeridian) {
			var meridianQ = new THREE.Quaternion();
			meridianQ.setFromAxisAngle(new THREE.Vector3( 0, 1, 0 ), meridian * KMG.PI_BY_180);
			inclinationQ.multiply(meridianQ);
		}
		
		/*
		var nodeAxis = new THREE.Vector3( 1, 0, 0 );
		nodeAxis.rotateY((orientation.node) * KMG.PI_BY_180);
		var satelliteQ = new THREE.Quaternion();
		satelliteQ.setFromAxisAngle( nodeAxis, -orientation.inclination * KMG.PI_BY_180 );	
		var meridianQ = new THREE.Quaternion();
		meridianQ.setFromAxisAngle(new THREE.Vector3( 0, 1, 0 ), -meridian * KMG.PI_BY_180);
		satelliteQ.multiply(meridianQ);
		*/
		
		inclinationQ.meridian = meridian - 90;
		inclinationQ.ra = orientation.ra;// * KMG._180_BY_PI;
		inclinationQ.dec = orientation.dec;
		inclinationQ.inclination = orientation.inclination;
		inclinationQ.node = orientation.node;
		inclinationQ.noMeridian = noMeridian;
		//inclinationQ.satelliteQ = satelliteQ;
		return inclinationQ;
	};
	
};


//////////////////////////////////////////////
// Sun
//////////////////////////////////////////////

KMG.IAUSunRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		var ra = 286.13;
		var dec = 63.87;

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 84.176 + 14.1844000 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUSunRotation.prototype = Object.create( KMG.IAURotation.prototype );


//////////////////////////////////////////////
// MERCURY
//////////////////////////////////////////////

KMG.IAUMercuryRotation = function() {
	
	KMG.IAURotation.call( this );
	
	function makeArgs(jd) {
		var M = [];
		
		M[0] = 0;
		M[1] = 174.791086 + 4.092335 * jd;
		M[2] = 349.582171 + 8.184670 * jd;
		M[3] = 164.373257 + 12.277005 * jd;
		M[4] = 339.164343 + 16.369340 * jd;
		M[5] = 153.955429 + 20.461675 * jd;
		return M;
	};
	
	this.__calculateOrientation = function(jd, t) {
		var ra = 281.0097 - 0.0328 * t;
		var dec = 61.4143 - 0.0049 * t;

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var M = makeArgs(jd);
		
		var meridian = 329.5469 + 6.1385025 * jd
								+ 0.00993822 * KMG.Math.dsin(M[1])
								- 0.00104581 * KMG.Math.dsin(M[2])
								- 0.00010280 * KMG.Math.dsin(M[3])
								- 0.00002364 * KMG.Math.dsin(M[4])
								- 0.00000532 * KMG.Math.dsin(M[5]);

		return {
			meridian : meridian
		};
	};
};
KMG.IAUMercuryRotation.prototype = Object.create( KMG.IAURotation.prototype );


//////////////////////////////////////////////
// VENUS
//////////////////////////////////////////////

KMG.IAUVenusRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		var ra = 272.76;
		var dec = 67.16;

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 160.20 - 1.4813688 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUVenusRotation.prototype = Object.create( KMG.IAURotation.prototype );




//////////////////////////////////////////////
// EARTH
//////////////////////////////////////////////

KMG.IAUEarthRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		var ra = 0.00 - 0.641 * t;
		//var dec = 90.00 - 0.557 * t;
		var dec = 90.00 - 23.4;

		var o = {
			ra : ra,
			dec : dec
		};
		
		return o;
	};
	
	this.__computeSiderealRotation = function(jd, t) {
		var meridian = 190.147 + 360.9856235 * jd;
		

		return {
			meridian : meridian
		};
	};
};
KMG.IAUEarthRotation.prototype = Object.create( KMG.IAURotation.prototype );

//////////////////////////////////////////////
// EARTH
//////////////////////////////////////////////

// Not yet a valid port from Celestia
KMG.EarthP03Rotation = function() {
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, T) {
		// Clamp T to the valid time range of the precession theory.
        if (T < -KMG.P03LP_VALID_CENTURIES)
            T = -KMG.P03LP_VALID_CENTURIES;
        else if (T > KMG.P03LP_VALID_CENTURIES)
            T = KMG.P03LP_VALID_CENTURIES;
        
        var prec = KMG.Procession.PrecObliquity_P03LP(T);
        var pole = KMG.Procession.EclipticPrecession_P03LP(T);
        
        var obliquity = KMG.Math.degToRad(prec.epsA / 3600);
        var precession = KMG.Math.degToRad(prec.pA / 3600);
        
        // Calculate the angles pi and Pi from the ecliptic pole coordinates
        // P and Q:
        //   P = sin(pi)*sin(Pi)
        //   Q = sin(pi)*cos(Pi)
        var P = pole.PA * 2.0 * Math.PI / 1296000;
        var Q = pole.QA * 2.0 * Math.PI / 1296000;
        var piA = Math.asin(Math.sqrt(P * P + Q * Q));
        var PiA = Math.atan2(P, Q);
		
		var o = {
			ra : piA * KMG._180_BY_PI,
			dec : PiA * KMG._180_BY_PI
		};
		//console.info(o);
		return o;
	};
	
	this.__computeSiderealRotation = function(jd, t) {
		var theta = 2 * Math.PI * (t * 24.0 / 23.9344694 - 259.853 / 360.0);
		//console.info(theta * KMG._180_BY_PI);
		return {
			meridian : theta * KMG._180_BY_PI
		};
	};
};
KMG.EarthP03Rotation.prototype = Object.create( KMG.IAURotation.prototype );




//////////////////////////////////////////////
// Moon
//////////////////////////////////////////////


KMG.IAULunarRotation = function() {
	
	KMG.IAURotation.call( this );

	function makeArgs(jd, t) {
		var E = [];
		E[0] = 0;
		E[1]  = (125.045 -  0.0529921 * jd);
        E[2]  = (250.089 -  0.1059842 * jd);
        E[3]  = (260.008 + 13.012009 * jd);
        E[4]  = (176.625 + 13.3407154 * jd);
        E[5]  = (357.529 +  0.9856993 * jd);
        E[6]  = (311.589 + 26.4057084 * jd);
        E[7]  = (134.963 + 13.0649930 * jd);
        E[8]  = (276.617 +  0.3287146 * jd);
        E[9]  = ( 34.226 +  1.7484877 * jd);
        E[10] = ( 15.134 -  0.1589763 * jd);
        E[11] = (119.743 +  0.0036096 * jd);
        E[12] = (239.961 +  0.1643573 * jd);
        E[13] = ( 25.053 + 12.9590088 * jd);
		return E;
	}
	

	// T = Julian Centuries of 36525 days from epoch
	// d = Julian Days from epoch
	this.__calculateOrientation = function(jd, t) {

		var E = makeArgs(jd);
		
		var ra = 269.9949
            + 0.0013 * t
            - 3.8787 * KMG.Math.dsin(E[1]) 
            - 0.1204 * KMG.Math.dsin(E[2])
            + 0.0700 * KMG.Math.dsin(E[3])
            - 0.0172 * KMG.Math.dsin(E[4])
            + 0.0072 * KMG.Math.dsin(E[6])
            - 0.0052 * KMG.Math.dsin(E[10])
            + 0.0043 * KMG.Math.dsin(E[13]);
            
        var dec = 66.5392
            + 0.0130 * t
            + 1.5419 * KMG.Math.dcos(E[1])
            + 0.0239 * KMG.Math.dcos(E[2])
            - 0.0278 * KMG.Math.dcos(E[3])
            + 0.0068 * KMG.Math.dcos(E[4])
            - 0.0029 * KMG.Math.dcos(E[6])
            + 0.0009 * KMG.Math.dcos(E[7])
            + 0.0008 * KMG.Math.dcos(E[10])
            - 0.0009 * KMG.Math.dcos(E[13]);
			
		return {
			ra : ra,
			dec : dec
		};
		
	};
	
	this.__computeSiderealRotation = function(jd) {

		var E = makeArgs(jd);
		var meridian = (38.3213
                + 13.17635815 * jd
                - 1.4e-12 * (jd * jd)
                + 3.5610 * KMG.Math.dsin(E[1])
                + 0.1208 * KMG.Math.dsin(E[2])
                - 0.0642 * KMG.Math.dsin(E[3])
                + 0.0158 * KMG.Math.dsin(E[4])
                + 0.0252 * KMG.Math.dsin(E[5])
                - 0.0066 * KMG.Math.dsin(E[6])
                - 0.0047 * KMG.Math.dsin(E[7])
                - 0.0046 * KMG.Math.dsin(E[8])
                + 0.0028 * KMG.Math.dsin(E[9])
                + 0.0052 * KMG.Math.dsin(E[10])
                + 0.0040 * KMG.Math.dsin(E[11])
                + 0.0019 * KMG.Math.dsin(E[12])
                - 0.0044 * KMG.Math.dsin(E[13]));
		
		return {
			meridian : meridian - 90
		};
		
	};
	
	
};
KMG.IAULunarRotation.prototype = Object.create( KMG.IAURotation.prototype );



//////////////////////////////////////////////
// MARS
//////////////////////////////////////////////

KMG.IAUMarsRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		var ra = 317.68143 - 0.1061 * t;
		var dec = 52.88650 - 0.0609 * t;

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 176.630 + 350.89198226 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUMarsRotation.prototype = Object.create( KMG.IAURotation.prototype );



//////////////////////////////////////////////
// JUPITER
//////////////////////////////////////////////

KMG.IAUJupiterRotation = function() {
	
	KMG.IAURotation.call( this );
	
	
	function calculateElements(t) {
		var Ja = 99.360714 + 4850.4046 * t;
		var Jb = 175.895369 + 1191.9605 * t;
		var Jc = 300.323162 + 262.5475 * t;
		var Jd = 114.012305 + 6070.2476 * t;
		var Je = 49.511251 + 64.3000 * t;
		
		return {
			Ja : Ja,
			Jb : Jb,
			Jc : Jc,
			Jd : Jd,
			Je : Je
		};
		
	};
	
	this.__calculateOrientation = function(jd, t) {
		
		var e = calculateElements(t);
		
		var α0 = 268.056595 - 0.006499 * t 
				+ 0.000117 * KMG.Math.dsin(e.Ja) 
				+ 0.000938 * KMG.Math.dsin(e.Jb)
				+ 0.001432 * KMG.Math.dsin(e.Jc)
				+ 0.000030 * KMG.Math.dsin(e.Jd) 
				+ 0.002150 * KMG.Math.dsin(e.Je);
				
		var δ0 = 64.495303 + 0.002413 * t 
				+ 0.000050 * KMG.Math.dcos(e.Ja)
				+ 0.000404 * KMG.Math.dcos(e.Jb)
				+ 0.000617 * KMG.Math.dcos(e.Jc)
				- 0.000013 * KMG.Math.dcos(e.Jd) 
				+ 0.000926 * KMG.Math.dcos(e.Je);
		δ0 = 86.87;
		return {
			ra : α0,
			dec : δ0
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var W = 284.95 + 870.5360000 * jd;
		
		return {
			meridian : W
		};
	};
};
KMG.IAUJupiterRotation.prototype = Object.create( KMG.IAURotation.prototype );



KMG.IAUJovianMoonRotation = function() {
	
	KMG.IAURotation.call( this );
	
	
	this.makeJovianMoonArgs = function(t) {
		var J = [];
		
		J[0] = 0;
		J[1] = 73.32 + 91472.9 * t;
		J[2] = 24.62 + 45137.2 * t;
		J[3] = 283.90 + 4850.7 * t;
		J[4] = 355.80 + 1191.3 * t;
		J[5] = 119.90 + 262.1 * t;
		J[6] = 229.80 + 64.3 * t;
		J[7] = 352.25 + 2382.6 * t;
		J[8] = 113.35 + 6070.0 * t;
		
		return J;
	}
	
};
KMG.IAUJovianMoonRotation.prototype = Object.create( KMG.IAURotation.prototype );

//////////////////////////////////////////////
// IO
//////////////////////////////////////////////

KMG.IAUIoRotation = function() {
	
	KMG.IAUJovianMoonRotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		
		var J = this.makeJovianMoonArgs(t);
		
		var ra = 268.05 - 0.009 * t + 0.094 * KMG.Math.dsin(J[3]) + 0.024 * KMG.Math.dsin(J[4]);
		var dec = 64.50 + 0.003 * t + 0.040 * KMG.Math.dcos(J[3]) + 0.011 * KMG.Math.dcos(J[4]);

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var t = this.julianCentury(jd);
		var J = this.makeJovianMoonArgs(t);
		var meridian = 200.39 + 203.4889538 * jd - 0.085 * KMG.Math.dsin(J[3]) - 0.022 * KMG.Math.dsin(J[4]);

		return {
			meridian : meridian
		};
	};
};
KMG.IAUIoRotation.prototype = Object.create( KMG.IAUJovianMoonRotation.prototype );




//////////////////////////////////////////////
// EUROPA
//////////////////////////////////////////////

KMG.IAUEuropaRotation = function() {
	
	KMG.IAUJovianMoonRotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		
		var J = this.makeJovianMoonArgs(t);
		
		var ra = 268.08 - 0.009 * t
				+ 1.086 * KMG.Math.dsin(J[4])
				+ 0.060 * KMG.Math.dsin(J[5])
				+ 0.015 * KMG.Math.dsin(J[6])
				+ 0.009 * KMG.Math.dsin(J[7]);



		var dec = 64.51 + 0.003 * t 
						+ 0.468 * KMG.Math.dcos(J[4])
						+ 0.026 * KMG.Math.dcos(J[5])
						+ 0.007 * KMG.Math.dcos(J[6])
						+ 0.002 * KMG.Math.dcos(J[7]);

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var t = this.julianCentury(jd);
		var J = this.makeJovianMoonArgs(t);
		var meridian = 36.022 + 101.3747235 * jd 
						- 0.980 * KMG.Math.dsin(J[4]) 
						- 0.054 * KMG.Math.dsin(J[5])
						- 0.014 * KMG.Math.dsin(J[6])
						- 0.008 * KMG.Math.dsin(J[7]);

		return {
			meridian : meridian
		};
	};
};
KMG.IAUEuropaRotation.prototype = Object.create( KMG.IAUJovianMoonRotation.prototype );



//////////////////////////////////////////////
// GANYMEDE
//////////////////////////////////////////////

KMG.IAUGanymedeRotation = function() {
	
	KMG.IAUJovianMoonRotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		
		var J = this.makeJovianMoonArgs(t);
		
		var ra = 268.20 - 0.009 * t
				- 0.037 * KMG.Math.dsin(J[4]) 
				+ 0.431 * KMG.Math.dsin(J[5]) 
				+ 0.091 * KMG.Math.dsin(J[6]);
		
		
		var dec = 64.57 + 0.003 * t
					- 0.016 * KMG.Math.dcos(J[4]) 
					+ 0.186 * KMG.Math.dcos(J[5])
					+ 0.039 * KMG.Math.dcos(J[6]);

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var t = this.julianCentury(jd);
		var J = this.makeJovianMoonArgs(t);
		var meridian = 44.064 + 50.3176081 * jd
						+ 0.033 * KMG.Math.dsin(J[4])
						- 0.389 * KMG.Math.dsin(J[5])
						- 0.082 * KMG.Math.dsin(J[6]);

		return {
			meridian : meridian
		};
	};
};
KMG.IAUGanymedeRotation.prototype = Object.create( KMG.IAUJovianMoonRotation.prototype );


//////////////////////////////////////////////
// CALLISTO
//////////////////////////////////////////////

KMG.IAUCallistoRotation = function() {
	
	KMG.IAUJovianMoonRotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {
		
		var J = this.makeJovianMoonArgs(t);
		
		var ra = 268.72 - 0.009 * t
					- 0.068 * KMG.Math.dsin(J[5]) 
					+ 0.590 * KMG.Math.dsin(J[6])
					+ 0.010 * KMG.Math.dsin(J[8]);
		
		
		var dec = 64.83 + 0.003 * t
					- 0.029 * KMG.Math.dcos(J[5]) 
					+ 0.254 * KMG.Math.dcos(J[6])
					- 0.004 * KMG.Math.dcos(J[8]);

		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var t = this.julianCentury(jd);
		var J = this.makeJovianMoonArgs(t);
		
		var meridian = 259.51 + 21.5710715 * jd
						+ 0.061 * KMG.Math.dsin(J[5]) 
						- 0.533 * KMG.Math.dsin(J[6])
						- 0.009 * KMG.Math.dsin(J[8]);

		return {
			meridian : meridian
		};
	};
};
KMG.IAUCallistoRotation.prototype = Object.create( KMG.IAUJovianMoonRotation.prototype );


//////////////////////////////////////////////
// SATURN
//////////////////////////////////////////////

KMG.IAUSaturnRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {

		var ra = 40.589 - 0.036 * t;
		var dec = 83.537 - 0.004 * t;
		
		dec = 63.27;
		
		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 38.90 + 810.7939024 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUSaturnRotation.prototype = Object.create( KMG.IAURotation.prototype );



//////////////////////////////////////////////
// TITAN
//////////////////////////////////////////////

KMG.IAUTitanRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {

		var ra = 39.4827;
		var dec = 83.4279;
		
		dec = 63.27;
		
		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 186.5855 + 22.5769768 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUTitanRotation.prototype = Object.create( KMG.IAURotation.prototype );


//////////////////////////////////////////////
// URANUS
//////////////////////////////////////////////

KMG.IAUUranusRotation = function() {
	
	KMG.IAURotation.call( this );
	
	this.__calculateOrientation = function(jd, t) {

		var ra = 257.311
		var dec = -15.175;
		
		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var meridian = 203.81 - 501.1600928 * jd;

		return {
			meridian : meridian
		};
	};
};
KMG.IAUUranusRotation.prototype = Object.create( KMG.IAURotation.prototype );



//////////////////////////////////////////////
// NEPTUNE
//////////////////////////////////////////////

KMG.IAUNeptuneRotation = function() {
	
	KMG.IAURotation.call( this );
	
	function computeN(t) {
		var n = 357.85 + 52.316 * t;
		return n;
	}
	
	this.__calculateOrientation = function(jd, t) {
		
		var N = computeN(t);
		
		var ra = 299.36 + 0.70 * KMG.Math.dsin(N);
		var dec = 43.46 - 0.51 * KMG.Math.dcos(N);
		
		return {
			ra : ra,
			dec : dec
		};
	};
	
	this.__computeSiderealRotation = function(jd) {
		var t = (jd - 2451545.0) / 36525.0;
		var N = computeN(t);
		var meridian = 253.18 + 536.3128492 * jd - 0.48 * KMG.Math.dsin(N);

		return {
			meridian : meridian
		};
	};
};
KMG.IAUNeptuneRotation.prototype = Object.create( KMG.IAURotation.prototype );
