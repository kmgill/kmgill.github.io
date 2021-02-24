
/* File: SatelliteMapRenderer.js */

function LongitudinalLine() {
	
	var points = [];
	var minX = 999999999999;
	var maxX = -999999999999;
	
	function addPoint(point) {
		if (point.x < minX) {
			minX = point.x;
		}
		if (point.x > maxX) {
			maxX = point.x;
		}
		points.push(point);
	}
	
	function getMinX() {
		return minX;
	}
	
	function getMaxX() {
		return maxX;
	}
	
	function getPoints() {
	
		var p = points.slice();
		p.sort(function(a, b) { return a.x - b.x; });
	
		return p;
	}
	
	return {
		addPoint : addPoint,
		getPoints : getPoints,
		getMinX : getMinX,
		getMaxX : getMaxX
	};
	
};

KMG.MapRenderer = function(canvas, satellites, sun, moon, location, time, mousePosition) {
	
	var config = {
		background : {
			showMap : true,
			showGrid : true,
			showTimestamp : true
		},
		sun : {
			showPosition : true,
			showTerminator : true,
			showNightShadow : true,
			showLabel : true
		},
		moon : {
			showPosition : true,
			showLabel : true
		},
		satellites : {
			showTrack : true,
			showVisualRange : true,
			showNumOrbits : 1,
			showLabel : true
		},
		location : {
			showPosition : true
		}
	
	};
	
	var SatelliteIcons = {
		"25544" : "iss-image",
		"default" : "satellite-image"
	};
	
	var ctx = canvas.getContext("2d");
	var width = canvas.width;
	var height = canvas.height;
	
	var borderWidth = 20;
	var centerLongitude = 0;
	
	var onRenderCallbacks = [];
	
	function addOnRenderCallback(c) {
		onRenderCallbacks.push(c);
	}
	
	function fireOnRenderCallbacks() {
		for (var i = 0; i < onRenderCallbacks.length; i++) {
			onRenderCallbacks[i]();
		}
	}
		
	function render() {
		ctx = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;
		
		if (config.background.showGrid) {
			borderWidth = 20;
		} else {
			borderWidth = 0;
		}
		
		ctx.clearRect(0, 0, width, height);
		ctx.rect(0,0,width,height);
		ctx.fillStyle="#252525";
		ctx.fill();
	
		if (config.background.showMap) {
			renderMap();
		}
		if (config.background.showGrid) {
			renderGrid();
		}
	
		renderSun();
		renderMoon();
	
		for (var i = 0; i < satellites.activeList.length; i++) {
			var satellite = satellites.activeList[i];
			renderSatelliteElements(satellite);
		}
		
		if (config.location.showPosition) {
			renderUserLocation();
		}
		
		
		
		if (config.background.showTimestamp) {
			renderTimeStamp();
		}
		
		if (config.background.showGrid) {
			renderBorder();
			renderGridLabels();
		}
		
		renderMousePosition();
		
		fireOnRenderCallbacks();
	}
	
	function renderMap() {
	
		var img = document.getElementById("map-image");
		
		var w = width-(borderWidth*2);
		var h = height-(borderWidth*2);
		
		var posXY = imagePosition(90, -180);
		ctx.drawImage(img,posXY.x,posXY.y, w, h);
		
		if (posXY.x > borderWidth) {
			ctx.drawImage(img,posXY.x-w,posXY.y, w, h);
		} else if (posXY.x < borderWidth) {
			ctx.drawImage(img,posXY.x+w,posXY.y, w, h);
		}
		
	
	}
	
	function renderBorder() {
		
		ctx.fillStyle="#000000";

		// Left
		ctx.beginPath();
		ctx.rect(0,0,borderWidth,height);
		ctx.fill();
		
		// Right
		ctx.beginPath();
		ctx.rect(width-borderWidth,0,width,height);
		ctx.fill();
		
		// Top
		ctx.beginPath();
		ctx.rect(0,0,width,borderWidth);
		ctx.fill();
		
		// Bottom
		ctx.beginPath();
		ctx.rect(0,height-borderWidth,width,height);
		ctx.fill();
		
	}
	
	function renderGridLabels() {
		
		ctx.textBaseline = 'top';
		ctx.strokeStyle = "#DBDBEA";
		ctx.fillStyle = "#DBDBEA";
		ctx.font = "10px Arial";
		ctx.textAlign="center";
		
		
		for (var lon = -180; lon <= 180; lon += 20) {
			var lat = 0;
			var posXY = imagePosition(lat, lon);
			ctx.fillText(""+lon, posXY.x, 5);
		}
		
		ctx.textBaseline = 'middle';
		for (var lat = -90; lat <= 90; lat += 20) {
			var lon = 0;
			var posXY = imagePosition(lat, lon);
			var s = ""+lat;
			ctx.fillText(s, 5 + borderWidth - ctx.measureText(s).width, posXY.y);
		}
	}
	
	function renderTimeStamp() {
		var ts = KMG.Astro.formatJulianDay(time.getTime(), true) + " UTC";
		
		ctx.textBaseline = 'top';
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#000000";
		ctx.font = "10px Arial";
		ctx.textAlign="left";
		ctx.fillText(ts, borderWidth+5, height - 15 - borderWidth);

	}
	
	
	function renderUserLocation() {
		if (!location || !config.location.showPosition) {
			return;
		}
		
		var posXY = imagePosition(location.getLatitude(), location.getLongitude());
		
		var img = document.getElementById("pin-image");
		
		var x = posXY.x - (img.width / 2);
		var y = posXY.y - (img.width / 2);
		
		ctx.drawImage(img, x, y);
	}
	
	
	function middleX() {
		var l = centerLongitude + 180;
		
		var w = width - (2 * borderWidth);
		var x = (l / 360) * w + borderWidth;
		
		return x - (w / 2) - borderWidth;
	}
	
	function imagePosition(lat, lon) {
		lat += 90;
		lon += 180;
		
		var w = width - (2 * borderWidth);
		var h = height - (2 * borderWidth);
		
		var x = (lon / 360) * w + borderWidth;
		var y = h - (lat / 180) * h + borderWidth;
		
		x -= middleX();
		
		
		if (x < borderWidth)
			x += w;
		if (y < borderWidth)
			y += h;
			
		if (x > (width - borderWidth)) 
			x -= w;
		if (y > (height - borderWidth))
			y -= h;
		
		
		return {
			x : x,
			y : y
		};
	}
	
	function bound(x, min, max) {
		if (x < min)
			return min;
		else if (x > max)
			return max;
		else
			return x;
	}
	
	
	
	function renderGrid() {
		
		ctx.strokeStyle = "#999999";
		ctx.lineWidth = 0.5;

		ctx.beginPath();
		
		for (var lat = -90; lat <= 90; lat += 20) {
			var leftXY = imagePosition(lat, -180);
			var rightXY = imagePosition(lat, 180);
			
			var lX = leftXY.x;
			var lY = leftXY.y;
			
			var rX = rightXY.x;
			var rY = rightXY.y;
			
			lX = parseInt(lX);
			lY = bound(parseInt(lY) + 0.5, 0.5, height-0.5);
			
			rX = parseInt(rX);
			rY = bound(parseInt(rY) + 0.5, 0.5, height-0.5);
			
			ctx.moveTo(lX, lY);
			ctx.lineTo(rX, rY);
			
		}
		
		for (var lon = -180; lon <= 180; lon += 20) {
			var topXY = imagePosition(90, lon);
			var bottomXY = imagePosition(-90, lon);
			
			var tX = topXY.x;
			var tY = topXY.y;
			
			var bX = bottomXY.x;
			var bY = bottomXY.y;
			
			tX = bound(parseInt(tX) + 0.5, 0.5, width-0.5);
			tX = (tX < width - borderWidth) ? tX : width - borderWidth - .5;
			tY = parseInt(tY);
			
			bX = bound(parseInt(bX) + 0.5, 0.5, width-0.5);
			bX = (bX < width - borderWidth) ? bX : width - borderWidth - .5;
			bY = parseInt(bY);

			ctx.moveTo(tX, tY);
			ctx.lineTo(bX, bY);
			
		}
		
		
		ctx.stroke();
	}
	
	
	function renderMoon() {
		
		renderMoonVisibleRange();
		
		if (!moon || !config.moon.showPosition) {
			return;
		}
		
		var position = moon.getPosition();
		if (!position) {
			return;
		}
		
		var posXY = imagePosition(position.lat, position.lon);
		var img = document.getElementById("moon-image");
		
		var x = posXY.x - (img.width / 2);
		var y = posXY.y - (img.width / 2);
		
		ctx.drawImage(img, x, y);
		
		renderObjectName(moonManager, "Moon");
	}
	
	function renderMoonVisibleRange() {
		if (!moon) {
			return;
		}
		
		var position = moon.getPosition();
		if (!position) {
			return;
		}
		
		if (config.moon.showVisualRange) {
			// Todo: Adjust for Earth's polar flattening, possibily also atmospheric refraction
			renderVisibleRange(position.lat,  position.lon, 40075 / 4, "#666666", 1.0, false, true);
		}
	}
	
	
	function renderSun() {
		renderSunVisibleRange();
		
		if (config.sun.showPosition) {
			renderSunPosition();
		}
		
		if (config.sun.showLabel) {
			renderObjectName(sunManager, "Sol");
		}	
	}
	
	function renderSunPosition() {
	
		if (!sun || !config.sun.showPosition) {
			return;
		}
		
		var position = sun.getPosition();
		if (!position) {
			return;
		}
		
		var posXY = imagePosition(position.lat, position.lon);
		var img = document.getElementById("sun-image");
		
		if (posXY.x < 0) {
			posXY.x += width;
		}
		
		var x = posXY.x - (img.width / 2);
		var y = posXY.y - (img.width / 2);
		
		ctx.drawImage(img, x, y);
		
	}
	
	
	function renderSunVisibleRange() {
		if (!sun) {
			return;
		}
		
		var position = sun.getPosition();
		if (!position) {
			return;
		}
		
		// Todo: Adjust for Earth's polar flattening, possibily also atmospheric refraction
		if (config.sun.showTerminator) {
			renderVisibleRange(position.lat,  position.lon, 40075 / 4, "#FF0000", 1.0, false, true);
		}
		
		if (config.sun.showTerminator || config.sun.showNightShadow) {
			var style = (config.sun.showTerminator) ? "#FFFFFF" : 'rgba(0,0,0,0)';
			renderVisibleRange(position.lat,  position.lon, 40075 / 4, style, 1.0, true, false, config.sun.showNightShadow);
		}
	}
	
	
	function renderFillArea(lonLine, shadowNorth) {
		ctx.beginPath();
		
		var boxY = (shadowNorth) ? 0 : height;
		
		var points = lonLine.getPoints();
		
		if (!points || points.length == 0) {
			return;
		}
		
		for (var i = 0; i < points.length; i++) {
			var point = points[i];
			
			if (i == 0) {
				ctx.moveTo(0, point.y);
			}
			
			ctx.lineTo(point.x, point.y);
		}
		
		ctx.lineTo(width, points[points.length - 1].y);
		
		ctx.lineTo(width, boxY);
		ctx.lineTo(0, boxY);
		ctx.lineTo(0, points[0].y);
		
		
		ctx.closePath();
		ctx.fillStyle = 'rgba(0,0,0,0.4)';
		ctx.fill();
	
	}
	

	function renderVisibleRange(lat, lon, angularRange, style, lineWidth, skipEvens, skipOdds, fill) {

		ctx.strokeStyle = style;
		ctx.lineWidth = (lineWidth) ? lineWidth : 1.5;
		ctx.beginPath();

		var d = angularRange;
		var R = 6378.135;
		var lat1 = lat * (Math.PI / 180);
		var lon1 = lon * (Math.PI / 180);
		
		var last = null;
		
		var north = new LongitudinalLine();
		var south = new LongitudinalLine();
		
		var i = 0;
		for (var b = 0; b <= 360; b++) {
			i++;
			var brng = b * (Math.PI / 180);
			
			var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + 
							Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
			var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1), 
							 Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));
			
			lat2 *= (180 / Math.PI);
			lon2 *= (180 / Math.PI);
			
			lon2 = KMG.Math.clamp((lon2 + 180), 360) - 180;
			
			var posXY = imagePosition(lat2, lon2);
			
			if (last && (!skipEvens || (skipEvens && i % 2 == 0)) && (!skipOdds || (skipOdds && i % 2 != 0))) {
				var point = strokeLineSegment(last.lon, lon2, last, posXY);
				//if (b <= 90 || b > 270) {
					north.addPoint(point);
				//}
			}

			last = {
				x : posXY.x,
				y : posXY.y,
				lon : lon2
			};
		}
		ctx.closePath();
		ctx.stroke();
		
		if (fill) {
			renderFillArea(north, (lat < 0));
		}
	}
	
	
	function strokeLineSegment(lastLon, posLon, lastXY, posXY) {
		var diff = posLon - lastLon;
		
		var point = {
			x : 0,
			y : 0
		};
		
		var w = width - (2 * borderWidth);
		var h = height - (2 * borderWidth);

		
		if (Math.abs(diff) > 180) {
			
			if (diff > 0) {
				ctx.moveTo(lastXY.x ,lastXY.y);
				ctx.lineTo(posXY.x-w,posXY.y);
				
				ctx.moveTo(lastXY.x+w ,lastXY.y);
				ctx.lineTo(posXY.x,posXY.y);
				
				point.x = posXY.x-w,
				point.y = posXY.y;
			} else {
				ctx.moveTo(lastXY.x ,lastXY.y);
				ctx.lineTo(posXY.x+w,posXY.y);

				ctx.moveTo(lastXY.x-w,lastXY.y);
				ctx.lineTo(posXY.x,posXY.y);
				
				point.x = posXY.x+w,
				point.y = posXY.y;
			}
			
		} else {
			ctx.moveTo(lastXY.x,lastXY.y);
			ctx.lineTo(posXY.x,posXY.y);
			point.x = posXY.x,
			point.y = posXY.y;

		}
		
		return point;
	}

	function renderSatelliteElements(satellite) {
	
		if (!satellite) {
			return;
		}
		/*
		satellites : {
			showTrack : true,
			showVisualRange : true,
			showNumOrbits : 1,
			showLabel : true
		},*/
		
		if (config.satellites.showTrack) {
			//renderTrack(satellite);
			
			renderTrack(satellite, "#FFFF00", function(position) { return position.inSunlight && !position.locallyVisible && !position.inLineOfSight; });
			renderTrack(satellite, "#FF7373", function(position) { return position.inLineOfSight && !position.locallyVisible; });
			renderTrack(satellite, "#FF2626", function(position) { return position.locallyVisible; });
			renderTrack(satellite, "#828200", function(position) { return !position.inSunlight && !position.inLineOfSight; });
		}
		
		if (config.satellites.showVisualRange) {
			renderSatelliteVisibleRange(satellite);
		}
		
		// Always show. It's the whole point of this.
		renderCurrentPos(satellite);
		
		if (config.satellites.showLabel) {
			renderObjectName(satellite, satellite.getName());
		}
	}
	
	function renderObjectName(object, name) {
	
		if (!object) {
			return
		}
		
		var currentPos = object.getPosition();
		if (!currentPos) {
			return;
		}
		
		var posXY = imagePosition(currentPos.lat, currentPos.lon);
		
		ctx.strokeStyle = "#FFFFFF";
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "12px Arial";
		ctx.textAlign="center";
		ctx.textBaseline = 'top';
		ctx.fillText(name, posXY.x,posXY.y+15);


	}
	
	
	function renderSatelliteVisibleRange(satellite) {

		var currentPos = satellite.getPosition();
		if (!currentPos) {
			return;
		}
		
		renderVisibleRange(currentPos.lat, currentPos.lon, currentPos.angularRange, "#00FF00");
		
	}
	
	
	
	function renderCurrentPos(satellite) {

		var currentPos = satellite.getPosition();
		if (!currentPos) {
			return;
		}
		
		var img;
		if (SatelliteIcons[satellite.id]) {
			img = document.getElementById(SatelliteIcons[satellite.id]);
		} else {
			img = document.getElementById(SatelliteIcons["default"]);
		}
		
		var posXY = imagePosition(currentPos.lat, currentPos.lon);

		var x = posXY.x - (img.width / 2);
		var y = posXY.y - (img.height / 2);
		
		ctx.drawImage(img, x, y);
		
	}
	
	
	function renderTrack(satellite, style, doStroke) {

		
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = style;
		
		var positions = satellite.getPositions();
		
		ctx.beginPath();
		var last = null;
		for (var i = 0; i < positions.length; i++) {
			var pos = positions[i];
			
			if (last != null && doStroke(pos)) {

				var lastXY = imagePosition(last.lat, last.lon);
				var posXY = imagePosition(pos.lat, pos.lon);
				
				strokeLineSegment(last.lon, pos.lon, lastXY, posXY);
			}
			
			last = pos;
		}
		ctx.stroke();
			
	}

	
	
	function renderMousePosition() {
		if (!mousePosition.over) {
			return;
		}
		
		if (mousePosition.x < borderWidth || mousePosition.x > (width - borderWidth)) {
			return;
		}
		
		if (mousePosition.y < borderWidth || mousePosition.y > (height - borderWidth)) {
			return;
		}
		
		var w = width - (2 * borderWidth);
		var h = height - (2 * borderWidth);
		
		var mx = mousePosition.x - borderWidth;
		var my = mousePosition.y - borderWidth;
		
		var lon = (mx / w) * 360 - 180;
		var lat = -((my / h) * 180 - 90);

		lon = KMG.Util.formatDegreesToMinutes(lon, "E", "W", true);
		lat = KMG.Util.formatDegreesToMinutes(lat, "N", "S", true);
				
		var label = "Lat: " + lat + ", Lon: " + lon;
		
		label = label.replace(/&deg;/g, String.fromCharCode(176));
		
		ctx.beginPath();
		ctx.fillStyle =  'rgba(0,0,0,0.2)';
		ctx.arc(mousePosition.x+1,mousePosition.y+1,2.5,0,2*Math.PI);
		ctx.fill();
		
		ctx.beginPath();
		ctx.fillStyle =  'rgba(255,255,255,0.7)';
		ctx.arc(mousePosition.x,mousePosition.y,2.5,0,2*Math.PI);
		ctx.fill();
		
		ctx.textBaseline = 'top';
		ctx.fillStyle =  'rgba(0,0,0,0.7)';
		ctx.fillRect(mousePosition.x+10, mousePosition.y+5, ctx.measureText(label).width, 13);
		
		ctx.beginPath();
		ctx.moveTo(mousePosition.x, mousePosition.y);
		ctx.lineTo(mousePosition.x+15, mousePosition.y+5);
		ctx.lineTo(mousePosition.x+10, mousePosition.y+5);
		ctx.lineTo(mousePosition.x+10, mousePosition.y+10);
		ctx.lineTo(mousePosition.x, mousePosition.y);
		ctx.closePath();
		ctx.fill();
		
		ctx.textBaseline = 'top';
		ctx.fillStyle =  'rgba(0,0,0,0.2)';
		ctx.fillRect(mousePosition.x+13, mousePosition.y+8, ctx.measureText(label).width, 13);
		
		ctx.beginPath();
		ctx.moveTo(mousePosition.x, mousePosition.y);
		ctx.lineTo(mousePosition.x+18, mousePosition.y+8);
		ctx.lineTo(mousePosition.x+18, mousePosition.y+8);
		ctx.lineTo(mousePosition.x+18, mousePosition.y+13);
		ctx.lineTo(mousePosition.x, mousePosition.y);
		ctx.closePath();
		ctx.fill();
		
		
		ctx.strokeStyle = "#FFFFFF";
		ctx.fillStyle = "#FFFFFF";
		ctx.font = "10px Arial";
		ctx.textAlign="left";
		
		ctx.fillText(label, mousePosition.x+15,mousePosition.y+5);
	}

	
	
	return {
		config : config,
		render : render,
		addOnRenderCallback : addOnRenderCallback
	}
};
