KMG.KeyCommandBindManager = function(engine) {
	
	var screenshotUnbind = null;
	var fullscreenUnbind = null;
	
	this.engine = engine;
	
	this.bindScreenshot = function() {
		if (screenshotUnbind) {
			return false;
		}
		if (this.engine && this.engine.context) {
			screenshotUnbind = THREEx.Screenshot.bindKey(this.engine.context.renderer);
			return true;
		} else {
			console.info("Failed to bind screenshot keys: Engine not found");
			return false;
		}
	};
	
	this.unbindScreenshot = function() {
		if (screenshotUnbind) {
			screenshotUnbind.unbind();
			screenshotUnbind = null;
		}
	};
	
	this.bindFullscreen = function() {
		if (fullscreenUnbind) {
			return false;
		}
		
		if( THREEx.FullScreen.available() ){
			fullscreenUnbind = THREEx.FullScreen.bindKey();
			return true;
		} else {
			return false;
		}
	};
	
	this.unbindFullscreen = function() {
		if (fullscreenUnbind) {
			fullscreenUnbind.unbind();
			fullscreenUnbind = null;
		}
	};
	
	this.bindAll = function() {
		var ssOk = this.bindScreenshot();
		var fsOk = this.bindFullscreen();
		return {
			screenshot : ssOk,
			fullscreen : fsOk
		};
	};
	
	this.unbindAll = function() {
		this.unbindScreenshot();
		this.unbindFullscreen();
	};
};
KMG.keyCommandBindManager = new KMG.KeyCommandBindManager();