
KMG.TickController = function(tickSpeed) {

	this.ticks = 0;
	
	this.tickSpeed = (tickSpeed) ? tickSpeed : 1.0;
	
	var active = false;
	var scope = this;
	
	this.start = function() {
		active = true;
	};
	
	this.stop = function() {
		active = false;
	};
	
	this.update = function() {
		if (active) {
			this.ticks += (this.tickSpeed * 1);
		}
	};

};

KMG.TimeBasedTickController = function(speed, onUpdate) {
	
	// Defaults to realtime starting now
	var epoch = KMG.Util.julianNow();
	this.speed = (speed) ? speed : 1;
	this.ticks = 0;

	this.tickJulian = epoch;
	this.tickDate = KMG.Util.julianToDate(this.tickJulian);
	
	var last = 0;
	var lastWarp = 0;
	
	var active = false;
	var scope = this;
	
	function fireOnUpdate() {
		if (onUpdate) {
			onUpdate(scope.tickJulian, scope.tickDate);
		}
	};
	
	this.getEpoch = function() {
		return epoch;
	};
	
	this.resetToToday = function() {
		epoch = KMG.Util.julianNow();
		this.ticks = 0;
		lastWarp = 0;
		this.update(true);
	};
	
	this.resetToJulianDay = function(jd) {
		epoch = jd;
		this.ticks = 0;
		lastWarp = 0;
		this.update(true);
	};
	
	this.resetToDate = function(millis) {
		var d = new Date(millis);
		epoch =  KMG.Util.dateToJulian(d.getFullYear(),
							d.getMonth() + 1,
							d.getDate(),
							d.getHours(),
							d.getMinutes(),
							d.getSeconds());
		last = d.getTime();
		this.ticks = 0;
		this.tickJulian = epoch;
		this.tickDate = KMG.Util.julianToDate(this.tickJulian);
		lastWarp = 0;
		fireOnUpdate();
	};

	
	
	this.isActive = function() {
		return active;
	};
	
	this.start = function() {
		active = true;
		last = (new Date()).getTime();
	};
	
	this.stop = function() {
		active = false;
	};
	
	this.update = function(force) {
		if (active || force) {
			var d = new Date();
			var now = d.getTime();

			var warp = 0;
			if (last > 0) {
				warp = ((now - last) *  this.speed) / (86400000);
				lastWarp += warp;
			}
			last = now;

			this.tickJulian = epoch + lastWarp;
			this.tickDate = KMG.Util.julianToDate(this.tickJulian);
			
			fireOnUpdate();
		}
	};

};





KMG.IntervalTimeBasedTickController = function(speed, interval, onUpdate) {
	
	// Defaults to realtime starting now
	var epoch = KMG.Util.julianNow();
	this.speed = (speed) ? speed : 1;
	this.interval = interval;
	this.ticks = 0;

	this.tickJulian = epoch;
	this.tickDate = KMG.Util.julianToDate(this.tickJulian);
	
	var last = 0;
	
	var active = false;
	var scope = this;
	
	function fireOnUpdate() {
		if (onUpdate) {
			onUpdate(scope.tickJulian, scope.tickDate);
		}
	};
	
	this.getEpoch = function() {
		return epoch;
	};
	
	this.resetToToday = function() {
		epoch = KMG.Util.julianNow();
		this.ticks = 0;
		this.update(true);
	};
	
	this.resetToJulianDay = function(jd) {
		epoch = jd;
		this.ticks = 0;
		this.update(true);
	};
	
	this.resetToDate = function(millis) {
		var d = new Date(millis);
		epoch =  KMG.Util.dateToJulian(d.getFullYear(),
							d.getMonth() + 1,
							d.getDate(),
							d.getHours(),
							d.getMinutes(),
							d.getSeconds());
		last = d.getTime();
		scope.ticks = 0;
		scope.tickJulian = epoch;
		this.tickDate = KMG.Util.julianToDate(scope.tickJulian);
		
		fireOnUpdate();
	};

	
	
	this.isActive = function() {
		return active;
	};
	
	this.start = function() {
		active = true;
		last = (new Date()).getTime();
	};
	
	this.stop = function() {
		active = false;
	};
	
	this.update = function(force) {
		if (active || force) {
			var d = new Date();
			var now = d.getTime();
			
			this.ticks += this.interval;

			this.tickJulian = epoch + this.ticks;
			this.tickDate = KMG.Util.julianToDate(this.tickJulian);
			
			fireOnUpdate();
		}
	};

};


