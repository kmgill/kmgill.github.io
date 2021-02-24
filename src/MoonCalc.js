/**
 * Lunar Algorithms
 * http://www.apoapsys.com
 * 
 * Copyright 2014 Kevin M. Gill <kmsmgill@gmail.com>
 *
 * Uses algorithms from:
 * Meeus, Jean: Astronomical Algorithms.
 * Richmond, Virg.: Willmann-Bell, 2009.
 * ISBN: 978-0943396613
 * http://amzn.com/0943396611
 * Chapter 13: Transformation of Coordinates
 * Chapter 22: Nutation and the Obliquity of the Ecliptic
 * Chapter 25: Solar Coordinates
 * Chapter 47: Position of the Moon
 * Chapter 48: Illuminated Fraction of the Moon's Disk
 * Chapter 49: Phases of the Moon
 * 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

if (!window.KMG) { window.KMG = {}; };

KMG.MoonCalc = function() {

	function sin(v) {
		return Math.sin(v * Math.PI / 180);
	}

	function cos(v) {
		return Math.cos(v * Math.PI / 180);
	}

	function tan(v) {
		return Math.tan(v * Math.PI / 180);
	}


	function cramp(v, within) {
		return v - within * Math.floor(v / within);
	}

	function deg(v) {
		return cramp(v, 360);
	}

	function asin(v) {
		return Math.asin(v) * 180 / Math.PI;
	}

	function acos(v) {
		return Math.acos(v) * 180 / Math.PI;
	}

	function atan2(y, x) {
		return Math.atan2(y, x) * 180 / Math.PI;
	}

	function atan(v) {
		return asin(v / Math.sqrt(pow(v, 2) + 1));
	}

	function sqrt(v) {
		return Math.sqrt(v);
	}

	function pow(v, e) {
		return Math.pow(v, e);
	}

	function degToDecimal(degrees, minutes, seconds) {
		return degrees + (minutes / 60) + (seconds / 60 / 60);
	}

	function secToDecimal(seconds) {
		return degToDecimal(0, 0, seconds);
	}

	function minToDecimal(minutes, seconds) {
		if (!seconds) // Checking for undefined or null
			seconds = 0;
		return degToDecimal(0, minutes, seconds);
	}


	function positionOfTheSun(T, lunarContext) {
		
		var obliquity;
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			obliquity = nutationAndObliquity(T, lunarContext);
		} else {
			obliquity = lunarContext.obliquity;
		}
		
		// Geometric mean longitude of the Sun
		var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * pow(T, 2);
		L0 = deg(L0);
		
		// Mean anomaly of the Sun
		var M = 357.52911 + 35999.05029 * T - 0.0001537 * pow(T, 2);
		M = deg(M);
		
		// Eccentricity of the Earth's orbit
		var e = 0.016708634 - 0.000042037 * T - 0.0000001267 * pow(T, 2);
		
		// Sun's equation of the center
		var C = (1.914602 - 0.004817 * T - 0.000014 * pow(T, 2)) * sin(M)
				+ (0.019993 - 0.000101 * T) * sin(2 * M)
				+ 0.000289 * sin(3 * M);
		
		// True longitude of the Sun
		var O = L0 + C;
		
		// True anomaly of the Sun
		var v = M + C;
		
		// Sun's radius vector (distance between the centers of
		// the Sun and the Earth, in AU)
		var R = (1.000001018 * (1 - pow(e, 2))) / (1 + e * cos(v));
		
		// Something important...
		var Ω = 125.04 - 1934.136 * T;
		
		// Apparent longitude of the Sun
		var λ = O - 0.00569 - 0.00478 * sin(Ω);
		
		var ε = obliquity.ε;
		
		var X = cos(ε) * sin(O);
		var Y = cos(O);
		
		// Right Ascension of the Sun
		var α = atan2(Y, X);
		α = deg(α);
		
		// Declination of the Sun
		var δ = asin(sin(ε) * sin(O));
		
		Y = cos(ε) * sin(λ);
		X = cos(λ);
		
		// Apparent Right Ascension of the Sun
		var αApp = atan2(Y, X);
		αApp = deg(αApp);
		
		// Apparent Declination of the Sun
		var δApp = asin(sin(ε + 0.00256 * cos(Ω)) * sin(λ));
		
		var sunPosition = {
			Ω : Ω,
			λ : λ,
			α : α,
			δ : δ,
			αApp : αApp,
			δApp : δApp,
			L0 : L0,
			M : M,
			e : e,
			C : C,
			O : O,
			v : v,
			R : R,
			T : T
		};
		
		if (lunarContext) {
			lunarContext.sunPosition = sunPosition;
		}
		
		return sunPosition;
	}


	// Periodic terms for the longitude (sigmaI) and distance (sigmaR) of the Moon. 
	// Unit is 0.000001 degree for sigmaI, and 0.001 kilometer for sigmaR
	// Table 47.A, Chapter 47, Page 339
	var table47A = [
		[0,  0,  1,  0,  6288774, -20905355],
		[2,  0, -1,  0,  1274027,  -3699111],
		[2,  0,  0,  0,   658314,  -2955968],
		[0,  0,  2,  0,   213618,   -569925],
		[0,  1,  0,  0,  -185116,     48888],
		[0,  0,  0,  2,  -114332,     -3149],
		[2,  0, -2,  0,    58793,    246158],
		[2, -1, -1,  0,    57066,   -152138],
		[2,  0,  1,  0,    53322,   -170733],
		[2, -1,  0,  0,    45758,   -204586],
		[0,  1, -1,  0,   -40923,   -129620],
		[1,  0,  0,  0,   -34720,    108743],
		[0,  1,  1,  0,   -30383,    104755],
		[2,  0,  0, -2,    15327,     10321], 
		[0,  0,  1,  2,   -12528,         0],
		[0,  0,  1, -2,    10980,     79661],
		[4,  0, -1,  0,    10675,    -34728],
		[0,  0,  3,  0,    10034,    -23210],
		[4,  0, -2,  0,     8548,    -21636],
		[2,  1, -1,  0,    -7888,     24208],
		[2,  1,  0,  0,    -6766,     30824],
		[1,  0, -1,  0,    -5163,     -8379],
		[1,  1,  0,  0,     4987,    -16675],
		[2, -1,  1,  0,     4036,    -12831],
		[2,  0,  2,  0,     3994,    -10445],
		[4,  0,  0,  0,     3861,    -11650],
		[2,  0, -3,  0,     3665,     14403],
		[0,  1, -2,  0,    -2689,     -7003],
		[2,  0, -1,  2,    -2602,         0],
		[2, -1, -2,  0,     2390,     10056],
		[1,  0,  1,  0,    -2348,      6322],
		[2, -2,  0,  0,     2236,     -9884],
		[0,  1,  2,  0,    -2120,      5751],
		[0,  2,  0,  0,    -2069,         0],
		[2, -2, -1,  0,     2048,     -4950],
		[2,  0,  1, -2,    -1773,      4130],
		[2,  0,  0,  2,    -1595,         0],
		[4, -1, -1,  0,     1215,     -3958],
		[0,  0,  2,  2,    -1110,         0],
		[3,  0, -1,  0,     -892,      3258],
		[2,  1,  1,  0,     -810,      2616],
		[4, -1, -2,  0,      759,     -1897],
		[0,  2, -1,  0,     -713,     -2117],
		[2,  2, -1,  0,     -700,      2354],
		[2,  1, -2,  0,      691,         0],
		[2, -1,  0, -2,      596,         0],
		[4,  0,  1,  0,      549,     -1423],
		[0,  0,  4,  0,      537,     -1117],
		[4, -1,  0,  0,      520,     -1571],
		[1,  0, -2,  0,     -487,     -1739],
		[2,  1,  0, -2,     -399,         0],
		[0,  0,  2, -2,     -381,     -4421],
		[1,  1,  1,  0,      351,         0],
		[3,  0, -2,  0,     -340,         0],
		[4,  0, -3,  0,      330,         0],
		[2, -1,  2,  0,      327,         0],
		[0,  2,  1,  0,     -323,      1165],
		[1,  1, -1,  0,      299,         0],
		[2,  0,  3,  0,      294,         0],
		[2,  0, -1, -2,        0,      8752]];

	// Periodic terms for the latitude of the Moon (sigmaB)
	// The unit is 0.000001 degree
	var table47B = [
		[0,  0,  0,  1,  5128122],
		[0,  0,  1,  1,   280602],
		[0,  0,  1, -1,   277693],
		[2,  0,  0, -1,   173237],
		[2,  0, -1,  1,    55413],
		[2,  0, -1, -1,    46271],
		[2,  0,  0,  1,    32573],
		[0,  0,  2,  1,    17198],
		[2,  0,  1, -1,     9266],
		[0,  0,  2, -1,     8822],
		[2, -1,  0, -1,     8216],
		[2,  0, -2, -1,     4324],
		[2,  0,  1,  1,     4200],
		[2,  1,  0, -1,    -3359],
		[2, -1, -1,  1,     2463],
		[2, -1,  0,  1,     2211],
		[2, -1, -1, -1,     2065],
		[0,  1, -1, -1,    -1870],
		[4,  0, -1, -1,     1828],
		[0,  1,  0,  1,    -1794],
		[0,  0,  0,  3,    -1749],
		[0,  1, -1,  1,    -1565],
		[1,  0,  0,  1,    -1491],
		[0,  1,  1,  1,    -1475],
		[0,  1,  1, -1,    -1410],
		[0,  1,  0, -1,    -1344],
		[1,  0,  0, -1,    -1335],
		[0,  0,  3,  1,     1107],
		[4,  0,  0, -1,     1021],
		[4,  0, -1,  1,      833],
		[0,  0,  1, -3,      777],
		[4,  0, -2,  1,      671],
		[2,  0,  0, -3,      607],
		[2,  0,  2, -1,      596],
		[2, -1,  1, -1,      491],
		[2,  0, -2,  1,     -451],
		[0,  0,  3, -1,      439],
		[2,  0,  2,  1,      422],
		[2,  0, -3, -1,      421],
		[2,  1, -1,  1,     -366],
		[2,  1,  0,  1,     -351],
		[4,  0,  0,  1,      331],
		[2, -1,  1,  1,      315],
		[2, -2,  0, -1,      302],
		[0,  0,  1,  3,     -283],
		[2,  1,  1, -1,     -229],
		[1,  1,  0, -1,      223],
		[1,  1,  0,  1,      223],
		[0,  1, -2, -1,     -220],
		[2,  1, -1, -1,     -220],
		[1,  0,  1,  1,     -185],
		[2, -1, -2, -1,      181],
		[0,  1,  2,  1,     -177],
		[4,  0, -2, -1,      176],
		[4, -1, -1, -1,      166],
		[1,  0,  1, -1,     -164],
		[4,  0,  1, -1,      132],
		[1,  0, -1, -1,     -119],
		[4, -1,  0, -1,      115],
		[2, -2,  0,  1,      107]];

	// Periodic terms for the nutation in longitude and in obliquity.
	// Units is 0.0001
	var table22A = [
		[ 0,  0,  0,  0,  1, -171996, -174.2, 92025,  8.9],
		[-2,  0,  0,  2,  2,  -13187,   -1.6,  5736, -3.1],
		[ 0,  0,  0,  2,  2,   -2274,   -0.2,   977, -0.5],
		[ 0,  0,  0,  0,  0,    2062,    0.2,  -895,  0.5],
		[ 0,  1,  0,  0,  0,    1426,   -3.4,    54, -0.1],
		[ 0,  0,  1,  0,  0,     712,    0.1,    -7,  0.0],
		[-2,  1,  0,  2,  2,    -517,    1.2,   224, -0.6],
		[ 0,  0,  0,  2,  1,    -386,   -0.4,   200,  0.0],
		[ 0,  0,  1,  2,  2,    -301,    0.0,   129, -0.1],
		[-2, -1,  0,  2,  2,     217,   -0.5,   -95,  0.3],
		[-2,  0,  1,  0,  0,    -158,    0.0,     0,  0.0],
		[-2,  0,  0,  2,  1,     129,    0.1,   -70,  0.0],
		[ 0,  0, -1,  2,  2,     123,    0.0,   -53,  0.0],
		[ 2,  0,  0,  0,  0,      63,    0.0,     0,  0.0],
		[ 0,  0,  1,  0,  1,      63,    0.1,   -33,  0.0],
		[ 2,  0, -1,  2,  2,     -59,    0.0,    26,  0.0],
		[ 0,  0, -1,  0,  1,     -58,   -0.1,    32,  0.0],
		[ 0,  0,  1,  2,  1,     -51,    0.0,    27,  0.0],
		[-2,  0,  2,  0,  0,      48,    0.0,     0,  0.0],
		[ 0,  0, -2,  2,  1,      46,    0.0,   -24,  0.0],
		[ 2,  0,  0,  2,  2,     -38,    0.0,    16,  0.0],
		[ 0,  0,  2,  2,  2,     -31,    0.0,    13,  0.0],
		[ 0,  0,  2,  0,  0,      29,    0.0,     0,  0.0],
		[-2,  0,  1,  2,  2,      29,    0.0,   -12,  0.0],
		[ 0,  0,  0,  2,  0,      26,    0.0,     0,  0.0],
		[-2,  0,  0,  2,  0,     -22,    0.0,     0,  0.0],
		[ 0,  0, -1,  2,  1,      21,    0.0,   -10,  0.0],
		[ 0,  2,  0,  0,  0,      17,   -0.1,     0,  0.0],
		[ 2,  0, -1,  0,  1,      16,    0.0,     8,  0.0],
		[-2,  2,  0,  2,  2,     -16,    0.1,     7,  0.0],
		[ 0,  1,  0,  0,  1,     -15,    0.0,     9,  0.0],
		[-2,  0,  1,  0,  1,     -13,    0.0,     7,  0.0],
		[ 0, -1,  0,  0,  1,     -12,    0.0,     6,  0.0],
		[ 0,  0,  2, -2,  0,      11,    0.0,     0,  0.0],
		[ 2,  0, -1,  2,  1,     -10,    0.0,     5,  0.0],
		[ 2,  0,  1,  2,  2,      -8,    0.0,     3,  0.0],
		[ 0,  1,  0,  2,  2,       7,    0.0,    -3,  0.0],
		[-2,  1,  1,  0,  0,      -7,    0.0,     0,  0.0],
		[ 0, -1,  0,  2,  0,      -7,    0.0,     3,  0.0],
		[ 2,  0,  0,  2,  1,      -7,    0.0,     3,  0.0],
		[ 2,  0,  1,  0,  0,       6,    0.0,     0,  0.0],
		[-2,  0,  2,  2,  2,       6,    0.0,    -3,  0.0],
		[-2,  0,  1,  2,  1,       6,    0.0,    -3,  0.0],
		[ 2,  0, -2,  0,  1,      -6,    0.0,     3,  0.0],
		[ 2,  0,  0,  0,  1,      -6,    0.0,     3,  0.0],
		[ 0, -1,  1,  0,  0,       5,    0.0,     0,  0.0],
		[-2, -1,  0,  2,  1,      -5,    0.0,     3,  0.0],
		[-2,  0,  0,  0,  1,      -5,    0.0,     3,  0.0],
		[ 0,  0,  2,  2,  1,      -5,    0.0,     3,  0.0],
		[-2,  0,  2,  0,  1,       4,    0.0,     0,  0.0],
		[-2,  1,  0, -2,  1,       4,    0.0,     0,  0.0],
		[ 0,  0,  1, -2,  0,       4,    0.0,     0,  0.0],
		[-1,  0,  1,  0,  0,      -4,    0.0,     0,  0.0],
		[-2,  1,  0,  0,  0,      -4,    0.0,     0,  0.0],
		[ 1,  0,  0,  0,  0,      -4,    0.0,     0,  0.0],
		[ 0,  0,  1,  2,  0,       3,    0.0,     0,  0.0],
		[ 0,  0, -2,  2,  2,      -3,    0.0,     0,  0.0],
		[-1, -1,  1,  0,  0,      -3,    0.0,     0,  0.0],
		[ 0,  1,  1,  0,  0,      -3,    0.0,     0,  0.0],
		[ 0, -1,  1,  2,  2,      -3,    0.0,     0,  0.0],
		[ 2, -1, -1,  2,  2,      -3,    0.0,     0,  0.0],
		[ 0,  0,  3,  2,  2,      -3,    0.0,     0,  0.0],
		[ 2, -1,  0,  2,  2,      -3,    0.0,     0,  0.0]];

	// Chapter 22
	function nutationAndObliquity(T, lunarContext) {
		
		// Mean Elongation Of The Moon From The Sun
		var D = 297.85036 + 445267.111480 * T - 0.0019142 * (T * T) + (T * T * T) / 189474;

		// Mean Anomaly of the Sun (Earth)
		var M = 357.52772 + 35999.050340 * T - 0.0001603 * (T * T) - (T * T * T) / 300000;



		// Mean Anomaly of the Moon
		var M_ = 134.96298 + 477198.867398 * T + 0.0086972 * (T * T) + (T * T * T) / 56250;



		// Moon's Argument of Latitude (ch. 22)
		var F = 93.27191 + 483202.017538 * T - 0.0036825 * (T * T) + (T * T * T) / 327270;



		// Longitude of teh ascending node of the Moon's mean orbit on the ecliptic
		// Measured from the mean equinox of the date (ch. 22)
		var Ω = 125.04452 - 1934.136261 * T + 0.0020708 * (T * T) + (T * T * T) / 450000;




		// Mean Longitude of the Sun
		var L = 280.4665 + 36000.7698 * T;

		// Mean Longitude of the Moon
		var L_ = 218.3165 + 481267.8813 * T;

		// Time measured in units of 10000 Julian years since J2000.0
		var U = T / 100;
		
		// Mean obliquity of the ecliptic
		var ε0 = degToDecimal(23, 26, 21.448)
						-degToDecimal(0, 0, 46.8150) * T
						-1.55 * pow(U, 2)
						+ 1999.25 * pow(U, 3)
						- 51.38 * pow(U, 4)
						- 249.67 * pow(U, 5)
						- 39.05 * pow(U, 6)
						+ 7.12 * pow(U, 7)
						+ 27.87 * pow(U, 8)
						+ 5.79 * pow(U, 9)
						+ 2.45 * pow(U, 10);
		
		D = deg(D);
		M = deg(M);
		M_ = deg(M_);
		F = deg(F);
		Ω = deg(Ω);


		// Nutation in Longitude Limited accuracy:
		var Δψ = -17.20 * sin(Ω) - 1.32 * sin(2 * L) - 0.23 * sin(2 * L_) + 0.21 * sin(2 * Ω);
		
		// Nutation in Obliquity Limited accuracy:
		var Δε = 9.20 * cos(Ω) + 0.57 * cos(2 * L) + 0.10 * cos(2 * L_) - 0.09 * cos(2 * Ω);
		
		// True obliquity of the ecliptic
		var ε = ε0 + Δε / 60 / 60;
		
		/*
		// Nutation in Longitude
		var deltaPsi = 0
		
		// Nutation in Obliquity
		var deltaEpsilon = 0;
		
		for (var i = 0; i < table22A.length; i++) {
			var row = table22A[i];
			
			var arg = row[0] * D + row[1] * M + row[2] * M_ + row[3] * F + row[4] * omega;
			
			var v0 = (row[5]) ? row[5] : 1;
			var v1 = (row[6]) ? row[6]  * T : 1;
			
			var v2 = (row[7]) ? row[7] : 1;
			var v3 = (row[8]) ? row[8] * T : 1;
			
			deltaPsi += v0 * sin(arg) + v1 * sin(arg);
			deltaEpsilon += v2 * cos(arg) + v3 * cos(arg);
		}
		*/
		
		

		var obliquity = {
			T : T,
			D : D,
			M : M,
			M_ : M_,
			F : F,
			Ω : Ω,
			Δψ : Δψ,
			Δε : deg(Δε),
			ε0 : ε0,
			ε : ε
		};
		
		if (lunarContext) {
			lunarContext.obliquity = obliquity;
		}
		
		return obliquity;

	}




	// Chapter 47
	function positionOfTheMoon(T, lunarContext) {
		
		var nutation;
		if (!lunarContext || !lunarContext.nutation || lunarContext.nutation.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.nutation;
		}
		
		// Mean Longitude of the Sun (ch. 22)
		var L = 280.4665 + 36000.7698 * T;
		
		// Mean Longitude of the Moon (ch. 47.1), or Mean Equinox of the Date, including the constant term of the 
		// effect of the light time (-0.70)
		var L_ = 218.3164477 + 481267.88123421 * T - 0.0015786 * (T * T) + (T * T * T) / 538841 - (T * T * T * T) / 65194000;
		
		// Mean Elongation of the Moon (ch. 47.2)
		var D = 297.8501921 + 445267.1114034 * T - 0.0018819 * (T * T) + (T * T * T) / 545868 - (T * T * T * T) / 113065000;

		// Mean Anomaly of the Sun (ch. 47.3)
		var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * (T * T) + (T * T * T) / 24490000;
		
		// Mean Anomaly of the Moon (ch. 47.4)
		var M_ = 134.9633964 + 477198.8675005 * T + 0.0087414 * (T * T) + (T * T * T) / 69699 - (T * T * T *T) / 14712000;
		
		// Moon's Argument of Latitude (mean distance of the Moon from it's ascending node) (ch. 47.5)
		var F = 93.2720950 + 483202.0175233 * T - 0.0036539 * (T * T) - (T * T * T) / 3526000 + (T * T * T * T) / 863310000;
		
		// Longitude of the Mean Ascending Node (ch. 47.7)
		var Ω = 125.0445479 - 1934.1362891 * T + 0.0020754 * (T * T) + (T * T * T) / 467441 - (T * T * T * T) / 60616000;
		
		var A1 = 119.75 + 131.849 * T;
		var A2 = 53.09 + 479264.290 * T;
		var A3 = 313.45 + 481266.484 * T;
		
		// Eccentricity of the Earth's orbit around the Sun
		var E = 1 - 0.002516 * T - 0.0000074 * (T * T);
		
		L = deg(L);
		L_ = deg(L_);
		D = deg(D);
		M = deg(M);
		M_ = deg(M_);
		F = deg(F);
		A1 = deg(A1);
		A2 = deg(A2);
		A3 = deg(A3);
		
		// Longitude of the Moon, unit is 0.000001 degrees
		var Σl = 0;
		var Σr = 0;
		var Σb = 0;
		
		for (var i = 0; i < table47A.length; i++) {
			var row = table47A[i];
			var e;
			if (row[1] == 1 || row[1] == -1) {
				e = E;
			} else if (row[1] == 2 || row[1] == -2) {
				e = E * E;
			} else {
				e = 1;
			}
			
			Σl += row[4] * e * sin(row[0] * D + row[1] * M + row[2] * M_ + row[3] * F);
			Σr += row[5] * e * cos(row[0] * D + row[1] * M + row[2] * M_ + row[3] * F);		
			
		}
		
		Σl += 3958 * sin(A1)
				+ 1962 * sin(L_ - F)
				+ 318 * sin(A2);
		
		
		for (var i = 0; i < table47B.length; i++) {
			var row = table47B[i];
			var e;
			if (row[1] == 1 || row[1] == -1) {
				e = E;
			} else if (row[1] == 2 || row[1] == -2) {
				e = E * E;
			} else {
				e = 1;
			}
			
			Σb += row[4] * e * sin(row[0] * D + row[1] * M + row[2] * M_ + row[3] * F);
		}
		
		Σb += -2235 * sin(L_)
				+ 382 * sin(A3)
				+ 175 * sin(A1 - F)
				+ 175 * sin(A1 + F)
				+ 127 * sin(L_ - M_)
				- 115 * sin(L_ + M_);
		
		// Geocentric longitude of the center of the Moon
		var λ = L_ + Σl / 1000000;
		
		
		
		
		// Geocentric latitude of the center of the Moon
		var β = Σb / 1000000;
		
		// Distance in kilometers between the centers of the Earth and Moon.
		var Δ = 385000.56 + Σr / 1000;
		
		// Equatorial horizontal parallax
		var π = asin(6378.14 / Δ);

		
		
		// Nutation in Longitude
		var Δψ = nutation.Δψ / 60 / 60;
		
		// Nutation in Obliquity
		var Δε = nutation.Δε;

		

		// Time measured in units of 10000 Julian years since J2000.0
		var U = T / 100;

		
		var apparentλ = λ + Δψ;

		// Mean obliquity of the ecliptic
		var ε0 = nutation.ε0;
		
		// True obliquity of the ecliptic
		var ε = nutation.ε;
		
		// Apparent right ascension (ch. 13.3)
		var X = cos(λ);
		var Y = (sin(λ) * cos(ε) - tan(β) * sin(ε));
		var α = deg(atan2(Y, X));
		//var α = atan((sin(λ) * cos(ε) - tan(β) * sin(ε)) / cos(λ));
		
		// Apparent declination (ch. 13.4)
		var δ = asin(sin(β) * cos(ε) + cos(β) * sin(ε) * sin(λ));
		
		// Mean perigee of the lunar orbit
		var Π = 83.3532465 
					+ 4096.0137287 * T 
					- 0.0103200 * pow(T, 2)
					- pow(T, 3) / 80053
					+ pow(T, 4) / 18999000;

		var position = {
			T : T,
			Σl : Σl, 
			Σr : Σr, 
			Σb : Σb,
			λ : λ,
			apparentλ : apparentλ,
			β   : β,
			Δ  : Δ,
			Ω  : Ω,
			Δψ : Δψ,
			Δε : Δε,
			ε0 : ε0,
			ε : ε,
			α  : α,
			αBy15 : α / 15,
			δ : δ,
			Π : Π,
			π     : π,
			E      : E,
			L      : L,
			L_     : L_,
			D      : D,
			M      : M,
			M_     : M_,
			F      : F,
			A1     : A1,
			A2     : A2,
			A3     : A3
		};
		
		if (lunarContext) {
			lunarContext.position = position;
		}
		
		return position;
	}





	function opticalLibrationsOfTheMoon(T, lunarContext) {
		
		var position;
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}

		var nutation;
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.obliquity;
		}

		// Inclination of the mean lunar equator to the ecliptic
		var I = 1.54242; 	
		
		
		var W = position.λ - secToDecimal(nutation.Δψ) - nutation.Ω;
		W = deg(W);
		
		var X = (sin(W) * cos(position.β) * cos(I) - sin(position.β) * sin(I));
		var Y = cos(W) * cos(position.β);
		var A = deg(atan2(X, Y), 360);
		//var A = atan((sin(W) * cos(position.β) * cos(I) - sin(position.β) * sin(I)) / (cos(W) * cos(position.β)))
		
		// Optical libration in longitude
		var l_ = A - position.F;
		
		// Optical libration in latitude
		var b_ = asin(-sin(W) * cos(position.β) * sin(I) - sin(position.β) * cos(I));
		
		var optLibr = {
			T : T,
			I : I,
			W : W,
			A : A,
			l_ : l_,
			b_ : b_
		};
		
		if (lunarContext) {
			lunarContext.optLibr = optLibr;
		}
		
		return optLibr;
	}




	function physicalLibrationsOfTheMoon(T, lunarContext) {
		
		var optLibr, position, nutation;
		
		if (!lunarContext || !lunarContext.optLibr || lunarContext.optLibr.T != T) {
			optLibr = opticalLibrationsOfTheMoon(T, lunarContext);
		} else {
			optLibr = lunarContext.optLibr;
		}
		
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}
		
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.obliquity;
		}
		
		
		var A = optLibr.A;
		var M_ = position.M_;
		var M = position.M;
		var F = position.F;
		var D = position.D;
		var E = position.E;
		var Ω = nutation.Ω;
		
		var b_ = optLibr.b_;
		
		var K1 = 119.75 + 131.849 * T;
		var K2 = 72.56 + 20.186 * T;
		
		var ρ = - 0.02752 * cos(M_)
				- 0.02245 * sin(F)
				+ 0.00684 * cos(M_ - 2 * F)
				- 0.00293 * cos(2 * F)
				- 0.00085 * cos(2 * F - 2 * D)
				- 0.00054 * cos(M_ - 2 * D)
				- 0.00020 * sin(M_ + F)
				- 0.00020 * cos(M_ + 2 * F)
				- 0.00020 * cos(M_ - F)
				+ 0.00014 * cos(M_ + 2 * F - 2 * D);
				
		
		var σ = - 0.02816 * sin(M_)
				+ 0.02244 * cos(F)
				- 0.00682 * sin(M_ - 2 * F)
				- 0.00279 * sin(2 * F)
				- 0.00083 * sin(2 * F - 2 * D)
				+ 0.00069 * sin(M_ - 2 * D)
				+ 0.00040 * cos(M_ + F)
				- 0.00025 * sin(2 * M_)
				- 0.00023 * sin(M_ + 2 * F)
				+ 0.00020 * cos(M_ - F)
				+ 0.00019 * sin(M_ - F)
				+ 0.00013 * sin(M_ + 2 * F - 2 * D)
				- 0.00010 * cos(M_ - 3 * F);
		
		var τ = + 0.02520 * E * sin(M)
				+ 0.00473 * sin(2 * M_ - 2 * F)
				- 0.00467 * sin(M_)
				+ 0.00396 * sin(K1)
				+ 0.00276 * sin(2 * M_ - 2 * D)
				+ 0.00196 * sin(Ω)
				- 0.00183 * cos(M_ - F)
				+ 0.00115 * sin(M_ - 2 * D)
				- 0.00096 * sin(M_ - D)
				+ 0.00046 * sin(2 * F - 2 * D)
				- 0.00039 * sin(M_ - F)
				- 0.00032 * sin(M_ - M - D)
				+ 0.00027 * sin(2 * M_ - M - 2 * D)
				+ 0.00023 * sin(K2)
				- 0.00014 * sin(2 * D)
				+ 0.00014 * cos(2 * M_ - 2 * F)
				- 0.00012 * sin(M_ - 2 * F)
				- 0.00012 * sin(2 * M_)
				+ 0.00011 * sin(2 * M_ - 2 * M - 2 * D);
		
		var l__ = -τ + (ρ * cos(A) + σ * sin(A)) * tan(b_);
		var b__ = σ * cos(A) - ρ * sin(A);
		
		
		var physLibr = {
			M : M,
			M_ : M_,
			F : F,
			D : D,
			E : E,
			A : A,
			ρ : ρ,
			σ : σ,
			τ : τ,
			K1 : K1,
			K2 : K2,
			l__ : l__,
			b__ : b__
		};
		
		if (lunarContext) {
			lunarContext.physLibr = physLibr;
		}
		
		return physLibr;
		
	}



	function totalLibrationsOfTheMoon(T, lunarContext) {
		
		var optLibr, physLibr;
		
		if (!lunarContext || !lunarContext.optLibr || lunarContext.optLibr.T != T) {
			optLibr = opticalLibrationsOfTheMoon(T, lunarContext);
		} else {
			optLibr = lunarContext.optLibr;
		}
		
		if (!lunarContext || !lunarContext.physLibr || lunarContext.physLibr.T != T) {
			physLibr = physicalLibrationsOfTheMoon(T, lunarContext);
		} else {
			physLibr = lunarContext.physLibr;
		}
		
		var l = optLibr.l_ + physLibr.l__;
		var b = optLibr.b_ + physLibr.b__;
		
		
		var ttlLibr = {
			T : T,
			l : l,
			b : b
		};
		
		if (lunarContext) {
			lunarContext.ttlLibr = ttlLibr;
		}
		
		return ttlLibr;
		
	}

	function selenographicPositionOfTheSun(T, lunarContext) {
		
		var position, sunPos, nutation, physLibr;
		
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}
		
		if (!lunarContext || !lunarContext.sunPosition || lunarContext.sunPosition.T != T) {
			sunPos = positionOfTheSun(T, lunarContext);
		} else {
			sunPos = lunarContext.sunPosition;
		}
		
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.obliquity;
		}
		
		if (!lunarContext || !lunarContext.physLibr || lunarContext.physLibr.T != T) {
			physLibr = physicalLibrationsOfTheMoon(T, lunarContext);
		} else {
			physLibr = lunarContext.physLibr;
		}
		
		
		// Geocentric right ascension of the Sun
		var α0 = sunPos.α;
		
		// Geocentric declination of the Sun
		var δ0 = sunPos.δ;
		
		// Geocentric longitude of Sun
		var λ0 = sunPos.O;

		// Geocentric right ascension of the Moon
		var α = position.α;
		
		// Geocentric declination of the Moon
		var δ = position.δ;
		
		// Geocentric longitude of Moon
		var λ = position.λ;
		
		
		// Distance from the Earth to the Sun
		var R = sunPos.R * 149597870.700;
		
		// Distance from the Earth to the Moon
		var Δ = position.Δ;
		
		// Geocentric latitude of the center of the Moon
		var β = position.β;
		
		
		
		var λH = λ0 + 180 + (Δ/R) * 57.296 * cos(β) * sin(λ0 - λ);
		
		var βH =  Δ / R * β;
		
		
		
		
		// Inclination of the mean lunar equator to the ecliptic
		var I = 1.54242; 	
		
		var W = λH - secToDecimal(nutation.Δψ) - nutation.Ω;
		W = deg(W);
		
		var X = (sin(W) * cos(βH) * cos(I) - sin(βH) * sin(I));
		var Y = cos(W) * cos(βH);
		var A = deg(atan2(X, Y), 360);

		// Optical libration in longitude
		var l_0 = A - position.F;
		
		// Optical libration in latitude
		var b_0 = asin(-sin(W) * cos(βH) * sin(I) - sin(βH) * cos(I));
		
		
		var l__0 = -physLibr.τ + (physLibr.ρ * cos(A) + physLibr.σ * sin(A)) * tan(b_0);
		var b__0 = physLibr.σ * cos(A) - physLibr.ρ * sin(A)
		
		var l0 = l_0 + l__0;
		var b0 = b_0 + b__0;;
		
		// Selenographic colongitude of the Sun
		var c0;
		
		if (l0 < 90) {
			c0 = 90 - l0;
		} else {
			c0 = 450 - l0;
		}

		
		var seleSunPosition = {
			T : T,
			λH : λH,
			βH : βH,
			l0 : l0,
			b0 : b0,
			c0 : c0,
			l_0 : l_0,
			b_0 : b_0,
			l__0 : l__0,
			b__0 : b__0,
			W : W,
			A : A,
			R : R,
			Δ : Δ
		};
		
		if (lunarContext) {
			lunarContext.seleSunPosition = seleSunPosition;
		}
		
		return seleSunPosition;
		
	}
	
	function phaseOfTheMoon(T, lunarContext) {
			
		var seleSunPosition;
		
		if (!lunarContext || !lunarContext.seleSunPosition || lunarContext.seleSunPosition.T != T) {
			seleSunPosition = selenographicPositionOfTheSun(T, lunarContext);
		} else {
			seleSunPosition = lunarContext.seleSunPosition;
		}
		
		
		
		var p = "";
		
		
		var c0 = seleSunPosition.c0;
		
		if (c0 >= 355 || c0 < 5) {
			p = "First Quarter";
		} else if (c0 < 85) {
			p = "Waxing Gibbous";
		} else if (c0 >= 85 && c0 < 95) {
			p = "Full Moon";
		} else if (c0 < 175) {
			p = "Waning Gibbous";
		} else if (c0 >= 175 && c0 < 185) {
			p = "Last Quarter";
		} else if (c0 < 265) {
			p = "Waning Crescent";
		} else if (c0 >= 265 && c0 < 275) {
			p = "New Moon";
		} else if (c0 < 355) {
			p = "Waxing Crescent";
		}
		
		
		var phase = {
			phase : p
		};
		
		if (lunarContext) {
			lunarContext.phase = phase;
		}
		
		return phase;
	}


	function positionAngleOfTheMoon(T, lunarContext) {
		
		var nutation, position, physLibr, ttlLibr;
		
		if (!lunarContext || !lunarContext.obliquity || lunarContext.obliquity.T != T) {
			nutation = nutationAndObliquity(T, lunarContext);
		} else {
			nutation = lunarContext.obliquity;
		}
		
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}
		
		if (!lunarContext || !lunarContext.physLibr || lunarContext.physLibr.T != T) {
			physLibr = physicalLibrationsOfTheMoon(T, lunarContext);
		} else {
			physLibr = lunarContext.physLibr;
		}
		
		if (!lunarContext || !lunarContext.ttlLibr || lunarContext.ttlLibr.T != T) {
			ttlLibr = totalLibrationsOfTheMoon(T, lunarContext);
		} else {
			ttlLibr = lunarContext.ttlLibr;
		}
		
		var b = ttlLibr.b;
		
		var Ω = nutation.Ω;
		
		// Inclination of the mean lunar equator to the ecliptic
		var I = 1.54242
		
		var Δψ = nutation.Δψ;
		
		var ρ = physLibr.ρ;
		
		var ε = position.ε;
		
		var α = position.α;
		
		var σ = physLibr.σ;
		
		var V = Ω + Δψ + σ / sin(I);
		
		var Y = sin(I + ρ) * sin(V);
		
		var X = sin(I + ρ) * cos(V) * cos(ε) - cos(I + ρ) * sin(ε);
		
		var ω = atan2(Y, X);
		
		var P = asin((sqrt(pow(X, 2) + pow(Y, 2)) * cos(α - ω)) / cos(b));
		
		var posAngle = {
			P : P
		};
		
		if (lunarContext) {
			lunarContext.posAngle = posAngle;
		}
		
		return posAngle;
		
	}



	function illuminatedFractionOfTheMoonsDisk(T, lunarContext) {
		
		var position, sunPos;
		
		if (!lunarContext || !lunarContext.position || lunarContext.position.T != T) {
			position = positionOfTheMoon(T, lunarContext);
		} else {
			position = lunarContext.position;
		}
		
		if (!lunarContext || !lunarContext.sunPosition || lunarContext.sunPosition.T != T) {
			sunPos = positionOfTheSun(T, lunarContext);
		} else {
			sunPos = lunarContext.sunPosition;
		}
		
		
		// Geocentric right ascension of the Sun
		var α0 = sunPos.αApp;
		
		// Geocentric declination of the Sun
		var δ0 = sunPos.δApp;
		
		// Geocentric longitude of Sun
		var λ0 = sunPos.O;
		
		// Geocentric right ascension of the Moon
		var α = position.α;
		
		// Geocentric declination of the Moon
		var δ = position.δ;
		
		// Geocentric longitude of Moon
		var λ = position.λ;
		
		// Geocentric elongation of the Moon from the Sun
		var ψ = acos(sin(δ0) * sin(δ) + cos(δ0) * cos(δ) * cos(α0 - α));
		
		// Distance from the Earth to the Sun
		var R = sunPos.R * 149597870.700;
		
		// Distance from the Earth to the Moon
		var Δ = position.Δ ;
		
		var Y = R * sin(ψ);
		var X =  Δ - R * cos(ψ)
		
		// Phase angle (Selenocentric elongation of the Earth from the Sun)
		var i = atan2(Y, X) ;
		
		
		var D = position.D;
		
		var M = position.M;
		
		var M_ = position.M_;
		
		
		// Phase angle (Selenocentric elongation of the Earth from the Sun)
		// Less accurate method
		/*
		var i = 180 - D
				- 6.289 * sin(M_)
				+ 2.100 * sin(M)
				- 1.274 * sin(2 * D - M_)
				- 0.658 * sin(2 * D)
				- 0.214 * sin(2 * M_)
				- 0.110 * sin(D);
		*/
		
		// Illuminated fraction of the Moon's disk
		var k = (1 + cos(i)) / 2;
		
		var Y = cos(δ0) * sin(α0 - α);
		var X = sin(δ0) * cos(δ) - cos(δ0) * sin(δ) * cos(α0 - α);
		
		// Position angle of the Moon's bright limb
		var χ = atan2(Y, X);
		
		
		var illumFrac = {
			T : T,
			k : k,
			i : i,
			χ : χ
		};
		
		if (lunarContext) {
			lunarContext.illumFrac = illumFrac;
		}
		
		return illumFrac;
	}



	function calculateAll(jd) {
		var T = (jd - 2451545) / 36525; // Julian Centuries since Epoch JD2000.0
		
		var context = {T : T};
		
		positionOfTheSun(T, context);
		nutationAndObliquity(T, context);
		positionOfTheMoon(T, context);
		opticalLibrationsOfTheMoon(T, context);
		physicalLibrationsOfTheMoon(T, context);
		totalLibrationsOfTheMoon(T, context);
		positionAngleOfTheMoon(T, context);
		illuminatedFractionOfTheMoonsDisk(T, context);
		selenographicPositionOfTheSun(T, context);
		phaseOfTheMoon(T, context);
		
		return context;
	}

	return {
		degToDecimal : degToDecimal,
		secToDecimal : secToDecimal,
		positionOfTheSun : positionOfTheSun,
		nutationAndObliquity : nutationAndObliquity,
		positionOfTheMoon : positionOfTheMoon,
		opticalLibrationsOfTheMoon : opticalLibrationsOfTheMoon,
		physicalLibrationsOfTheMoon : physicalLibrationsOfTheMoon,
		totalLibrationsOfTheMoon : totalLibrationsOfTheMoon,
		positionAngleOfTheMoon : positionAngleOfTheMoon,
		illuminatedFractionOfTheMoonsDisk : illuminatedFractionOfTheMoonsDisk,
		selenographicPositionOfTheSun : selenographicPositionOfTheSun,
		phaseOfTheMoon : phaseOfTheMoon,
		calculateAll : calculateAll
	};
};
