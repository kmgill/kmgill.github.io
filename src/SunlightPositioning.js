
KMG.SunlightPositioning = function() {
	

	
	function limitDegrees(degrees) {
		var limited;
		degrees /= 360.0;
		limited = 360.0 * (degrees - Math.floor(degrees));
		if (limited < 0) {
			limited += 360.0;
		}
		return limited;
	}
	
	function julianDay(year, month, day, hour, minute, second, tz) {
		var day_decimal, julian_day, a;

		day_decimal = day + (hour - tz + (minute + second / 60.0) / 60.0) / 24.0;

		if (month < 3) {
			month += 12;
			year--;
		}

		julian_day = Math.floor(365.25 * (year + 4716.0)) + Math.floor(30.6001 * (month + 1)) + day_decimal - 1524.5;
		if (julian_day > 2299160.0) {
			a = Math.floor(year / 100);
			julian_day += (2 - a + Math.floor(a / 4));
		}
		console.info("Julian Day: " + julian_day);
		return julian_day;
		
	}
	
	function julianDayFromDate(date) {
		return julianDay(date.getFullYear()
					, date.getMonth() + 1
					, date.getDate()
					, date.getHours()
					, date.getMinutes()
					, date.getSeconds()
					, 0);
	}
	
	
	function julianCentury(jd) {
		return (jd - 2451545.0) / 36525.0;
	}
	

	
	//http://stackoverflow.com/questions/8619879/javascript-calculate-days-in-a-year-year-to-date
	function dayOfYear(date) {
		var start = new Date(date.getFullYear(), 0, 0);
		var diff = date - start;
		var oneDay = 1000 * 60 * 60 * 24;
		var day = Math.floor(diff / oneDay);
		return day;
	}
	
	function dayOfYearFromJulianDay(jd) {
		var dt = KMG.Util.julianToDate(jd);
		return dayOfYear(dt);
	}
	
	//function minutesToTod(minutes) {
		//var hour = Math.floor(minutes / 60.0)
		//var minute = Math.floor(minutes - (hour * 60));
		//var second = Math.floor(60.0 * (minutes - (hour * 60) - minute));
	//}
	
	function toMinutes(date) {
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        
		var tod = hour * 60.0 + minute + (second / 60.0);
		
        return tod;
    }
	
	function toMinutesFromJulianDay(jd) {
		var dt = KMG.Util.julianToDate(jd);
		return toMinutes(dt);
	}
	
	function radians(d) {
		return d*(Math.PI/180.0);
	}
	
	function degrees(r) {
		return r*(180.0/Math.PI);
	}
	
	function approxAtmosphericRefraction(solarElevation) {
		var refr = 0;
		if (solarElevation > 85) {
			refr = 0;
		} else if (solarElevation > 5) {
			refr = 58.1 / Math.tan(radians(solarElevation)) - 0.07 / (Math.pow(Math.tan(radians(solarElevation)), 3)) + 0.000086 / (Math.pow(Math.tan(radians(solarElevation)), 5))
		} else if (solarElevation > -0.575) {
			refr = 1735 + solarElevation *(-518.2 + solarElevation * (103.4 + solarElevation * (-12.79+solarElevation*0.711)));
		} else {
			refr = -20.772 / Math.tan(radians(solarElevation));
		}
		return refr / 3600.0;
	}
	
	function correctedSolarElevation(solarElevation) {
		return solarElevation + approxAtmosphericRefraction(solarElevation);
	}
	
	// Doesn't account for atmospheric influence
	this.getSunPositionOnDate = function(date){
		var jd = julianDayFromDate(date);
		return this.getSunPositionOnJulianDay(jd);
	};
	
	// Doesn't account for atmospheric influence
	this.getSunPositionOnJulianDay = function(jd, longitude, latitude, calcDetails) {
	
	
		// Take care of undefined or null values
		if (!longitude) {
			longitude = 0;
		}
		
		if (!latitude) {
			latitude = 0;
		}
		//var latitude = 0.0;
		//var longitude = 0.0;
			
		
		var jc = julianCentury(jd);
		
		var n = jd - 2451545.0; // Number of days from J2000.0
		var L = 280.460 + 0.9856474 * n; // Mean longitude of the Sun,
		
		var g = 357.528 + 0.9856003 * n; // Mean anomaly of the sun
		L = limitDegrees(L);
		g = limitDegrees(g);

		var _g = radians(g);
		var _L = radians(L);

		var eclipticLongitude = L + 1.915 * Math.sin(_g) + 0.020 * Math.sin(2 * _g);
		var eclipticLatitude = 0;

		// Distance of the sun in astronomical units
		var R = 1.00014 - 0.01671 * Math.cos(_g) - 0.00014 * Math.cos(2 * _g);

                // Obliquity of the ecliptic
		var e = 23.439 - 0.0000004 * n;

		var eccentricityEarthOrbit = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);

		var _eclipticLongitude = radians(eclipticLongitude);
		var _eclipticLatitude = radians(eclipticLatitude);

		var _e = radians(e);

		var N = dayOfYearFromJulianDay(jd);

		var rightAscension = Math.atan((Math.sin(_eclipticLongitude) * Math.cos(_e) - Math.tan(_eclipticLatitude) * Math.sin(_e)) / Math.cos(_eclipticLongitude));
		var declination = Math.atan((Math.sin(_e) * Math.sin(_eclipticLongitude) * Math.cos(_eclipticLatitude) + Math.cos(_e) * Math.sin(_eclipticLatitude)));
		var o = -e * (Math.cos(radians((360.0 / 365.0) * (N + 10.0))));


		var obliquityCorrection = e + 0.00256 * Math.cos(radians(125.04 - 1934.136 * jc));
		var y = Math.pow(Math.tan(radians(obliquityCorrection) / 2.0), 2);

		var equationOfTime = degrees(y * Math.sin(2.0 * _L) - 2.0 * eccentricityEarthOrbit * Math.sin(_g) + 4.0 * eccentricityEarthOrbit * y * Math.sin(_g) * Math.cos(2.0 * _L)
                                - 0.5 * y * y * Math.sin(4.0 * _L) - 1.25 * eccentricityEarthOrbit * eccentricityEarthOrbit * Math.sin(2.0 * _g)) * 4.0; // in
                                                                                                                                                                                                                                                                                                // minutes
                                                                                                                                                                                                                                                                                                // of
                                                                                                                                                                                                                                                                                                // time

		var tod = toMinutesFromJulianDay(jd);
		
		var trueSolarTime = (tod + equationOfTime + 4.0 * longitude - 60.0 * 0 /* 0==tz*/);

		var ha = 0;
		if (trueSolarTime / 4.0 < 0.0)
			ha = trueSolarTime / 4.0 + 180.0;
		else
			ha = trueSolarTime / 4.0 - 180.0;
		
		


		var rotateY = rightAscension + (ha - longitude);
		var rotateX = declination;

		var xyz = new THREE.Vector3(R * 149598000000.0, 0, 0); // R (AU) in meters
		
		if (THREE.Euler) {
			var e = new THREE.Euler( radians(rotateX), radians(-rotateY), radians(o), 'XYZ' );
			xyz.applyEuler(e);
			xyz.euler = e;
		}
		
		xyz.solarY = radians(-rotateY);
		
		
		if (calcDetails) {
		
			var zenithAngle = degrees(Math.acos(Math.sin(radians(latitude))*Math.sin(radians(declination))+Math.cos(radians(latitude))*Math.cos(radians(declination))*Math.cos(radians(ha))));
		
			var azimuthAngle = 0;
			if (ha > 0) {
				azimuthAngle = degrees(Math.acos(((Math.sin(radians(latitude))*Math.cos(radians(zenithAngle)))-Math.sin(radians(declination)))/(Math.cos(radians(latitude))*Math.sin(radians(zenithAngle)))))+180
			} else {
				azimuthAngle = 540-degrees(Math.acos(((Math.sin(radians(latitude))*Math.cos(radians(zenithAngle)))-Math.sin(radians(declination)))/(Math.cos(radians(latitude))*Math.sin(radians(zenithAngle)))))
			}
			azimuthAngle = KMG.Math.clamp(azimuthAngle, 360);
			
			
			var haSunrise = degrees(Math.acos(Math.cos(radians(90.833))/(Math.cos(radians(latitude))*Math.cos(radians(declination)))-Math.tan(radians(latitude)) * Math.tan(radians(declination))));
			var sunRiseTimeUTC = 720 - (4.0 * (longitude + haSunrise)) - equationOfTime;
			var sunSetTimeUTC = 720 - (4.0 * (longitude - haSunrise)) - equationOfTime;
			
			sunRiseTimeUTC = Math.floor(jd) + (sunRiseTimeUTC / 60 / 24) - .5;
			sunSetTimeUTC = Math.floor(jd) + (sunSetTimeUTC / 60 / 24) - .5;
			xyz.details = {
				rightAscension : degrees(rightAscension),
				hourAngle : degrees(ha),
				trueSolarTime : trueSolarTime,
				equationOfTime : equationOfTime,
				declination : declination * KMG._180_BY_PI,
				zenithAngle : zenithAngle,
				elevationAngle : (90 - zenithAngle),
				apparentElevationAngle : correctedSolarElevation((90 - zenithAngle)),
				azimuthAngle : azimuthAngle,
				sunriseUTC : sunRiseTimeUTC,
				sunsetUTC : sunSetTimeUTC,
				distance : R,
				viewer : {
					latitude : latitude,
					longitude : longitude
				}
			};
		}

		return xyz;
    };
	
};