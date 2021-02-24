


KMG.SolveKeplerFunc1 = function(ecc, M) {
	this.solve = function(x) {
		return M + ecc * Math.sin(x);
	};
};

KMG.SolveKeplerFunc2 = function(ecc, M) {
	this.solve = function(x) {
		return x + (M + ecc * Math.sin(x) - x) / (1 - ecc * Math.cos(x));
	};
};

KMG.SolveKeplerLaguerreConway = function(ecc, M) {
	this.solve = function(x) {
		var s = ecc * Math.sin(x);
		var c = ecc * Math.cos(x);
		var f = x - s - M;
		var f1 = 1 - c;
		var f2 = s;

		x += -5 * f / (f1 + KMG.Math.sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2)));
		return x;
	};
};

KMG.SolveKeplerLaguerreConwayHyp = function(ecc, M) {
	this.solve = function(x) {
		var s = ecc * KMG.Math.sinh(x);
		var c = ecc * KMG.Math.cosh(x);
		var f = x - s - M;
		var f1 = c - 1;
		var f2 = s;

		x += -5 * f / (f1 + KMG.Math.sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2)));
		return x;
	};
};

KMG.Orbit = function() 
{



};

// Values valid from 1800 AD through 2050 AD
// See http://iau-comm4.jpl.nasa.gov/keplerformulae/kepform.pdf
KMG.OrbitDefinitions = {
	
	template : {
		semiMajorAxis : 0,
		longitudeOfPerihelion : 0,
		eccentricity : 0,
		inclination : 0,
		ascendingNode : 0, 
		argOfPeriapsis : 0,
		meanAnomalyAtEpoch : 0,
		period : 0
	},
	
	mercury : {
		semiMajorAxis : 0.38709927,
		longitudeOfPerihelion : 77.45779628, //longitudeOfPerihelion
		eccentricity : 0.20563593, //eccentricity
		inclination : 7.00497902, // inclination
		ascendingNode : 48.33076593, //longitudeOfAscendingNode
		argOfPeriapsis : 29.124, // = longitudeOfPerihelion - longitudeOfAscendingNode
		meanAnomalyAtEpoch : 174.796,
		period : 0.240876 * 365.25
	},
	
	venus : {
		semiMajorAxis : 0.72333566,
		longitudeOfPerihelion : 131.60246718,
		eccentricity : 0.00677672,
		inclination : 3.39467605,
		ascendingNode : 76.67984255, 
		argOfPeriapsis : 55.186,
		meanAnomalyAtEpoch : 50.115,
		period : 0.615198 * 365.25
	},
	
	earth : {
		semiMajorAxis : 1.00000261,
		longitudeOfPerihelion : 102.947,
		eccentricity : 0.0167,
		inclination : 0.0001,
		ascendingNode : 348.73936,
		argOfPeriapsis : 114.20783,
		meanAnomalyAtEpoch : 357.51716,
		period : 1.000017421 * 365.25
	},

	mars : {
		semiMajorAxis : 1.52371034,
		longitudeOfPerihelion : -23.94362959,
		eccentricity : 0.09339410,
		inclination : 1.84969142,
		ascendingNode : 49.55953891, 
		argOfPeriapsis : 286.537,
		meanAnomalyAtEpoch : 19.3564,
		period : 1.8808 * 365.25
	},

	ceres : {
		semiMajorAxis : 2.7654,
		longitudeOfPerihelion : 0,
		eccentricity : 0.079138,
		inclination : 10.587,
		ascendingNode : 80.3932, 
		argOfPeriapsis : 72.5898,
		meanAnomalyAtEpoch : 113.410,
		period : 4.60 * 365.25
	},
	vesta : {
		semiMajorAxis : 2.361534940452743E+00,
		longitudeOfPerihelion : 149.84,
		eccentricity : 9.002246842706077E-02,
		inclination : 7.133937445524650E+00,
		ascendingNode : 1.039514249511780E+02, 
		argOfPeriapsis : 1.495866622389732E+02,
		meanAnomalyAtEpoch : 3.410238523604547E+02,
		period : 1.325531309325364E+03
	},
	
	jupiter : {
		semiMajorAxis : 5.20288700,
		longitudeOfPerihelion : 14.72847983,
		eccentricity : 0.04838624,
		inclination : 1.30439695,
		ascendingNode : 100.47390909, 
		argOfPeriapsis : 275.066, 
		meanAnomalyAtEpoch : 18.818,
		period : 11.8618 * 365.25
	},
	
	saturn : {
		semiMajorAxis : 9.53667594,
		longitudeOfPerihelion : 92.59887831,
		eccentricity : 0.05386179,
		inclination : 2.48599187,
		ascendingNode : 113.66242448, 
		argOfPeriapsis : 336.013862, //-21.063546169999995
		meanAnomalyAtEpoch : 320.349750,
		period : 29.4571 * 365.25
	},
	
	uranus : {
		semiMajorAxis : 19.18916464,
		longitudeOfPerihelion : 170.95427630,
		eccentricity : 0.04725744,
		inclination : 0.77263783,
		ascendingNode : 74.01692503, 
		argOfPeriapsis : 96.93735127000001,
		meanAnomalyAtEpoch : 142.955717,
		period : 84.323326 * 365.25
	},
	
	neptune : {
		semiMajorAxis : 30.06992276,
		longitudeOfPerihelion : 44.96476227,
		eccentricity : 0.00859048,
		inclination : 1.77004347,
		ascendingNode : 131.78422574, 
		argOfPeriapsis : 265.646853,
		meanAnomalyAtEpoch : 267.767281,
		period : 164.79 * 365.25
	},
	
	pluto : {
		semiMajorAxis : 39.48211675,
		longitudeOfPerihelion : 224.06891629,
		eccentricity : 0.24882730,
		inclination : 17.14001206,
		ascendingNode : 110.30393684,
		argOfPeriapsis : 113.76498945, 
		meanAnomalyAtEpoch : 14.86012204,
		period : 247.68 * 365.25
	},
	
	sedna : {
		semiMajorAxis : 518.57,
		longitudeOfPerihelion : 0,
		eccentricity : 0.8527,
		inclination : 11.927,
		ascendingNode : 144.26, 
		argOfPeriapsis : 311.02,
		meanAnomalyAtEpoch : 358.01,
		period : 11400 * 365.25
	},
	makemake : {
		semiMajorAxis : 4.537149503754902E+01,
		longitudeOfPerihelion : 0,
		eccentricity : 1.645302661137667E-01,
		inclination : 2.900018092674307E+01,
		ascendingNode : 7.927479351325880E+01, 
		argOfPeriapsis : 2.962796702827131E+02,
		meanAnomalyAtEpoch : 1.397247535166562E+02,
		period : 1.116279789467439E+05
	},
	haumea : {
		semiMajorAxis : 4.290900504570640E+01,
		longitudeOfPerihelion : 0,
		eccentricity : 1.999240087754753E-01,
		inclination : 2.820613695665376E+01,
		ascendingNode : 1.219331357048411E+02, 
		argOfPeriapsis : 2.405918328387456E+02,
		meanAnomalyAtEpoch : 1.895938765545494E+02,
		period : 1.026646884377227E+05
	},
	eris : {
		semiMajorAxis : 6.814528383022676E+01,
		longitudeOfPerihelion : 0,
		eccentricity : 4.324547411204651E-01,
		inclination : 4.374037864588535E+01,
		ascendingNode : 3.612861006165989E+01, 
		argOfPeriapsis : 1.508355993252542E+02,
		meanAnomalyAtEpoch : 1.943095415904719E+02,
		period : 2.054717566990577E+05
	},
	
	
	
	/*
	moon : {
		semiMajorAxis : 2.552673530695038E-03,
		longitudeOfPerihelion : 0,
		eccentricity : 6.314721694601848E-02,
		inclination : 2.094230382118301E+01,
		ascendingNode : 1.223643870385490E+01, 
		argOfPeriapsis : 6.154181757216567E+01,
		meanAnomalyAtEpoch : 1.466732745658298E+02,
		period : 0.07396621937613547, 
		epoch : 2451545
	}*/
	
	moon : {
		moon : true,
		semiMajorAxis : 0.00256955529,
		longitudeOfPerihelion : 0,
		eccentricity : 0.0549,
		inclination : 5.145,
		ascendingNode : 1.239580563903234E+02, 
		argOfPeriapsis : 3.089226717609726E+02,
		meanAnomalyAtEpoch : 260.5603266810552,
		period : 2.701616162713348E+01//27.321582//0.07396621937613547 * 365.25
	},
	titan : {
		semiMajorAxis : 8.168127483657287E-03,
		longitudeOfPerihelion : 0,
		eccentricity : 2.860074434716717E-02,
		inclination : 2.771833743784899E+01,
		ascendingNode : 1.692391586820226E+02, 
		argOfPeriapsis : 1.644078851778261E+02,
		meanAnomalyAtEpoch : 1.643780911447081E+02,
		period : 1.594734092046106E+01//27.321582//0.07396621937613547 * 365.25
	}

};





/**
 * Adapted from http://sourceforge.net/p/celestia/code/5229/tree/trunk/celestia/src/celephem/orbit.cpp
 */
KMG.EllipticalOrbit = function(orbitProperties)
{
	KMG.Orbit.call( this );
	
	this.semiMajorAxis = orbitProperties.semiMajorAxis;
	this.eccentricity = orbitProperties.eccentricity;
	this.inclination = orbitProperties.inclination * (Math.PI / 180.0);
	this.ascendingNode = orbitProperties.ascendingNode * (Math.PI / 180.0);
	this.argOfPeriapsis = orbitProperties.argOfPeriapsis * (Math.PI / 180.0);
	this.meanAnomalyAtEpoch = orbitProperties.meanAnomalyAtEpoch;
	this.period = orbitProperties.period ;
	
	this.orbitProperties = orbitProperties;
	
	this.epoch = (orbitProperties.epoch) ? orbitProperties.epoch : 2451545;
	this.derivativeOfMeanMotion = (orbitProperties.derivativeOfMeanMotion) ? orbitProperties.derivativeOfMeanMotion : 0;
	
	//this.pericenterDistance = (orbitProperties.pericenterDistance) ? orbitProperties.pericenterDistance : this.semiMajorAxis * (1 - this.eccentricity);
	this.pericenterDistance = this.semiMajorAxis * (1 - this.eccentricity);
	//this.meanMotion = (orbitProperties.meanMotion) ? (orbitProperties.meanMotion) : (2.0 * Math.PI) / this.period;
	//this.meanMotion = 1 / this.period;
	this.meanMotion = (orbitProperties.meanMotion) ? (orbitProperties.meanMotion) : 1 / this.period;
	
	var ascendingNodeRotation = new THREE.Matrix4();
	ascendingNodeRotation.makeRotationZ(this.ascendingNode);
	
	var inclinationRotation = new THREE.Matrix4();
	inclinationRotation.makeRotationX(this.inclination);
	
	var argOfPeriapsisRotation = new THREE.Matrix4();
	argOfPeriapsisRotation.makeRotationZ(this.argOfPeriapsis );
	
	this.orbitPlaneRotation = new THREE.Matrix4();
	this.orbitPlaneRotation.identity();
	
	this.orbitPlaneRotation.multiplyMatrices( ascendingNodeRotation, inclinationRotation );
	this.orbitPlaneRotation.multiply( argOfPeriapsisRotation );
	
	
	var scope = this;
	
	function solveIterationFixed(f, x0, maxIter) {
		
		var x = 0;
		var x2 = x0;
		
		for (var i = 0; i < maxIter; i++) {
			x = x2;
			x2 = f.solve(x);
		}
		
		return [x2, x2 - x];
	}
	
	

	
	function eccentricAnomaly(M) {
		if (scope.eccentricity == 0.0) {
			return M;
		} else if (scope.eccentricity < 0.2) {
		
			var sol = solveIterationFixed(new KMG.SolveKeplerFunc1(scope.eccentricity, M), M, 5);

			return sol[0];
		
		} else if (scope.eccentricity < 0.9) {
		
			var sol = solveIterationFixed(new KMG.SolveKeplerFunc2(scope.eccentricity, M), M, 6);
			return sol[0];
		
		} else if (scope.eccentricity < 1.0) {
			var E = M + 0.85 * scope.eccentricity * ((Math.sin(M) >= 0.0) ? 1 : -1);
			
			var sol = solveIterationFixed(new KMG.SolveKeplerLaguerreConway(scope.eccentricity, M), E, 8);
			return sol[0];
			
		} else if (scope.eccentricity == 1.0) {
			return M;
		} else {
			var E = Math.log(2 * M / scope.eccentricity + 1.85);
			
			var sol = solveIterationFixed(new KMG.SolveKeplerLaguerreConwayHyp(scope.eccentricity, M), E, 30);
			return sol[0];
		}
	}
	
	this.positionAtE = function(E) {
		var x, y;
		
		if (this.eccentricity < 1.0) {
			var a = this.pericenterDistance / (1.0 - this.eccentricity);
			x = a * (Math.cos(E) - this.eccentricity);
			y = a * Math.sqrt(1 - this.eccentricity * this.eccentricity) * Math.sin(E);
		} else if (this.eccentricity > 1.0) {
			var a = this.pericenterDistance / (1.0 - this.eccentricity);
			x = -a * (this.eccentricity - KMG.Math.cosh(E));
			y = -a * Math.sqrt(this.eccentricity * this.eccentricity - 1) * KMG.Math.sinh(E);
		} else {
			x = 0.0;
			y = 0.0;
		}
		
		var pos = new THREE.Vector3(x, y, 0);
		pos.applyMatrix4(this.orbitPlaneRotation);
		
		return pos;
	};
	
	
	this.velocityAtE = function(E) {
		var x, y;

		if (this.eccentricity < 1.0) {
			var a = this.pericenterDistance / (1.0 - this.eccentricity);
			var sinE = Math.sin(E);
			var cosE = Math.cos(E);
        
			x = -a * sinE;
			y =  a * Math.sqrt(1 - KMG.Math.sqr(this.eccentricity)) * cosE;
		
			var meanMotion = 2.0 * Math.PI / this.period;
			var edot = meanMotion / (1 - this.eccentricity * cosE);
			x *= edot;
			y *= edot;
		} else if (this.eccentricity > 1.0) {
			var a = this.pericenterDistance / (1.0 - this.eccentricity);
			x = -a * (this.eccentricity - KMG.Math.cosh(E));
			y = -a * Math.sqrt(KMG.Math.sqr(this.eccentricity) - 1) * KMG.Math.sinh(E);
		} else {
			// TODO: Handle parabolic orbits
			x = 0.0;
			y = 0.0;
		}
		
		var v = new THREE.Vector3(x, y, 0);
		v.applyMatrix4(this.orbitPlaneRotation);
		
		return new THREE.Vector3(v.x, v.z, -v.y);
	};
	
	function trimTo360(x) {	
		if( x > 0.0 ) {
			while( x > 360.0 )
				x = x-360.0;
		} else {
			while( x< 0.0 )
				x =x+ 360.0;
		}
		return(x)
	}
	
	this.meanAnomalyAtTime = function(t) {
		var timeSinceEpoch = (t - this.epoch);
		var meanAnomaly = this.meanAnomalyAtEpoch*1+(360*(this.meanMotion*(timeSinceEpoch)+0.5*this.derivativeOfMeanMotion*(timeSinceEpoch)*(timeSinceEpoch))) ; 
		meanAnomaly = trimTo360(meanAnomaly) * (Math.PI / 180);
		return meanAnomaly; // in radians
	};
	
	this.trueAnomalyAtTime = function(t, meanAnomaly, E) {
		if (!meanAnomaly) {
			meanAnomaly = this.meanAnomalyAtTime(t);
		}
		if (!E) {
			E = eccentricAnomaly(meanAnomaly);
		}
		
		var true_anomaly=Math.acos((  Math.cos(E)-this.eccentricity)/(1-this.eccentricity*Math.cos(E))  ) ;
		return true_anomaly; // In radians
	};
	
	this.eccentricAnomalyAtTime = function(t) {
		var meanAnomaly = this.meanAnomalyAtTime(t);
		var E = eccentricAnomaly(meanAnomaly);
		return E;
	};
	
	this.velocityAtTime = function(t) {
		var E = this.eccentricAnomalyAtTime(t);
		var v = this.velocityAtE(E);
		v.multiplyScalar(1.0 / 86400.0);
		v.magnitude = Math.sqrt(KMG.Math.sqr(v.x) + KMG.Math.sqr(v.y) + KMG.Math.sqr(v.z));
		return v;
	};
	
	this.positionAtTime = function(t) {
		var meanAnomaly = this.meanAnomalyAtTime(t);
		var E = eccentricAnomaly(meanAnomaly);
		var pos = this.positionAtE(E);
		var v = new THREE.Vector3(pos.x, pos.z, -pos.y);
		v.E = E;
		v.M = meanAnomaly;
		v.trueAnomaly = this.trueAnomalyAtTime(t, meanAnomaly, E);
		return v;
		//return new THREE.Vector3(pos.x, pos.y, pos.z);
	};
	
	this.distanceAtTime = function(t) {
		var trueAnomaly = this.trueAnomalyAtTime(t);
		var p = this.semiMajorAxis * (1 - KMG.Math.sqr(this.eccentricity));
		var r = p / (1 + this.eccentricity * Math.cos(trueAnomaly));
		return r;
	
	};
	
	this.propertiesAtTime = function(t) {
		var timeSinceEpoch = (t - this.epoch);
		
		var meanAnomalyAtTime = this.meanAnomalyAtTime(t);
		meanAnomalyAtTime = KMG.Math.trimTo360Radians(meanAnomalyAtTime * (Math.PI / 180));
		
		var distanceAtTime = this.distanceAtTime(t);
		var velocityAtTime = this.velocityAtTime(t);
		var trueAnomalyAtTime = this.trueAnomalyAtTime(t);
		
		var eccentricAnomalyAtTime = this.eccentricAnomalyAtTime(meanAnomalyAtTime);
		var positionAtTime = this.positionAtE(eccentricAnomalyAtTime);
		var coordinatesAtTime = new THREE.Vector3(positionAtTime.x, positionAtTime.z, -positionAtTime.y);
		
		
		
		var props = {
			time : t,
			epoch : this.epoch,
			timeSinceEpoch : timeSinceEpoch,
			meanAnomalyAtEpoch : this.meanAnomalyAtEpoch,
			meanAnomalyAtTime : meanAnomalyAtTime,
			distanceAtTime : distanceAtTime, // To center of orbit
			velocityAtTime : velocityAtTime, // km per second
			velocityMagnitudeAtTime : velocityAtTime.magnitude, // km per second
			trueAnomalyAtTime : trueAnomalyAtTime,
			eccentricAnomalyAtTime : eccentricAnomalyAtTime,
			positionAtTime : positionAtTime,
			coordinatesAtTime : coordinatesAtTime,
			meanMotion : this.meanMotion,
			ephemeris : this.orbitProperties
		};
		return props;
	};
	
};
KMG.EllipticalOrbit.prototype = Object.create( KMG.Orbit.prototype );






