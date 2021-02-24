/**
 * PlanetMaker JavaScript Library
 * http://planetmaker.wthr.us
 * 
 * Copyright 2013 Kevin M. Gill <kmsmgill@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */


if (!window.KMG) { window.KMG = {}; };
KMG.Util = {};


self.console = self.console || {

	info: function () {},
	log: function () {},
	debug: function () {},
	warn: function () {},
	error: function () {}

};

KMG.RAD_360 = 360 * (Math.PI / 180);
KMG.RAD_270 = 270 * (Math.PI / 180);
KMG.RAD_180 = 180 * (Math.PI / 180);
KMG.RAD_90 = 90 * (Math.PI / 180);
KMG.RAD_45 = 45 * (Math.PI / 180);
KMG.AU_TO_KM = 149597870.700;
KMG.PI_BY_180 = (Math.PI / 180);
KMG._180_BY_PI = (180 / Math.PI);

