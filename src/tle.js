

KMG.tle = {};

KMG.tle.parseTle = function(tleString) {
	
	var data = {};
	
	var lines = tleString.split("\n");
	if (lines.length < 2 || lines.length > 3) {
		throw "Invalid TLE";
	}
	
	data.name = (lines.length == 3) ? lines[0] : "foo";
	var tleLine1 = (lines.length == 3) ? lines[1] : lines[0];
	var tleLine2 = (lines.length == 3) ? lines[2] : lines[1];
	
	KMG.tle.parseTleLine1(tleLine1, data);
	KMG.tle.parseTleLine2(tleLine2, data);
	KMG.tle.computeAdditionalData(data);
	
	return data;
}

KMG.tle.computeAdditionalData = function(data) {
	data.epochStart = KMG.tle.dayNumberTle(2000 + data.epochYear, data.epochDay);
	data.epochNow = KMG.tle.dayNumberNow();
	data.epoch = data.epochStart + 2451545 - 1.5;
	data.periodHours = (1440/((1*data.meanMotion)+(data.derivativeOfMeanMotion*(data.epochNow-data.epochStart )))) /60;
	data.semiMajorAxis = Math.pow((6028.9* (data.periodHours*60)), 2.0 / 3.0) / 149597870.700;
	data.period = data.periodHours / 24;
	data.longitudeOfPerihelion = 0;
}

KMG.tle.parseTleLine1 = function(tleLine1, data) {

	data.satelliteNumber = tleLine1.substring(2, 7);
	data.classification = tleLine1.substring(7, 8);
	data.internationalDesignator = tleLine1.substring(9, 17);
	data.launchYear = data.internationalDesignator.substring(0, 2);
	data.launchNumberForYear = data.internationalDesignator.substring(2, 5);
	data.launchPieceNumber = data.internationalDesignator.substring(5, 8);
	data.epochYear = parseFloat(tleLine1.substring(18, 20));
	data.epochDay = parseFloat(tleLine1.substring(20, 32));
	data.derivativeOfMeanMotion = parseFloat(tleLine1.substring(33, 43)); // first_derative_mean_motion
	data.dragTerm = parseFloat("0." + tleLine1.substring(53, 61)); // Is fractional, prefix with 0.
	data.ephemerisType = tleLine1.substring(62, 63);
	data.elementNumber = tleLine1.substring(64, 68);
	data.checksum = tleLine1.substring(68, 69);
}

KMG.tle.parseTleLine2 = function(tleLine2, data) {

	data.inclination = parseFloat(tleLine2.substring(8, 16));
	data.rightAscension = parseFloat(tleLine2.substring(17, 25)); // of the ascending node
	data.ascendingNode = data.rightAscension;
	data.eccentricity = parseFloat("0." + tleLine2.substring(26, 33)); // Is fractional, prefix with 0.
	data.argOfPeriapsis = parseFloat(tleLine2.substring(34, 42));
	data.meanAnomalyAtEpoch = parseFloat(tleLine2.substring(43, 51));
	data.meanMotion = parseFloat(tleLine2.substring(52, 63));
	data.revolutionNumber = tleLine2.substring(63, 68);

}

KMG.tle.div = function(a, b) {
	return ((a - a % b) / b);
}

KMG.tle.dayNumber = function(dd,mm,yyyy,hh,min,sec) {
	var d=367.0*yyyy - KMG.tle.div(  (7.0*(yyyy+(KMG.tle.div((mm+9.0),12.0)))),4.0 ) + KMG.tle.div((275.0*mm),9.0) + dd - 730530.0 ;
	d=d+ hh/24.0 + min/(60.0*24.0) + sec/(24.0*60.0*60.0);
	return d;
}

KMG.tle.dayNumberTle = function(year, day) {
	var d = KMG.tle.dayNumber(1,1,year,0,0,0)+day-1;
	return d
}

KMG.tle.dayNumberNow = function() {
	var dt = new Date();
	return KMG.tle.dayNumber(dt.getUTCDate(), dt.getUTCMonth() + 1, dt.getUTCFullYear(), dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
}

/*

var tle0 = "2015-020D  \n" +              
"1 40555U 15020D   15092.11961771  .00000009  00000-0  00000+0 0  9995\n" + 
"2 40555  82.4855  61.9592 0216449 266.9285  90.7024 12.80861395   194";


console.log(tle0);
var data = KMG.tle.parseTle(tle0, KMG.tle.THREE_LINE);
console.log(data);
*/
