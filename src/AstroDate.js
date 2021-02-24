
KMG.J2000 = 2451545.0;
KMG.J1900 = 2415020.0;

KMG.AstroDate = function(millis, jd, epoch) {
	
	if (!epoch) {
		epoch = KMG.J2000;
	}
	
	if (!millis && !jd) {
		jd = KMG.Util.julianNow();
	}
	
	if (millis != undefined && millis != null) {
		jd = KMG.Util.millisToJulian(millis);
	}
	
	// Julian day overrides millis
	if (jd != undefined && jd != null) {
		millis = KMG.Util.julianToDate(jd).getTime();
	}

	function getMillis() {
		return millis;
	}
	
	function getJulianDay() {
		return jd;
	}
	
	function getJulianCentury(_epoch) {
		if (!_epoch) {
			_epoch = epoch;
		}
		return (jd - _epoch) / 36525.0;
	}
	
	function getDayNumberNow() {
		return KMG.Astro.getDayNumberNow();
	}
	
	function getDayNumber(_jd) {
		if (!_jd) {
			_jd = jd;
		}
		return KMG.Astro.getDayNumber(_jd);
	}
	
	function getGMST(clampTo) {
		return KMG.Astro.getGMST(jd, clampTo);
	}
	
	function getLMST(lon) {
		return KMG.Astro.getLMST(jd, lon);
	}
	
	//http://www.satellite-calculations.com/TLETracker/scripts/tletracker.online.sat.calc
	function getGMST2(lon, _jd) {
		if (!_jd) {
			_jd = jd;
		}
		return KMG.Astro.getGMST2(lon, _jd);
	}
	
	function getDate(_jd) {
		if (!_jd) {
			_jd = jd;
		}
		return KMG.Util.julianToDate(_jd);
	}
	
	function getDayOfYear() {
		return KMG.Astro.getDayOfYear(jd);
	}
	
	function toString(format) {
		var d = getDate();
		return d.toString();
	}
		
	function toJSON() {
		return {
			millis : millis,
			jd : jd,
			date : toString() + " UTC"
		};
	}
	return {
		getMillis : getMillis,
		getJulianDay : getJulianDay,
		getGMST : getGMST,
		getLMST : getLMST,
		getGMST2 : getGMST2,
		getJulianCentury : getJulianCentury,
		getDayOfYear : getDayOfYear,
		getDayNumberNow : getDayNumberNow,
		getDayNumber : getDayNumber,
		getDate : getDate,
		toString : toString,
		toJSON : toJSON
	
	};
	
};