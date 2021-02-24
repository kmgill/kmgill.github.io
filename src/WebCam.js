/**
 * PlanetMaker JavaScript Webcam Interface API
 * http://planetmaker.wthr.us
 * 
 * Copyright 2013 Kevin M. Gill
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

KMG.WebCamUtil = {

	isWebcamAvailable : function() {
		navigator.getUserMedia = ( navigator.getUserMedia ||
								navigator.webkitGetUserMedia ||
								navigator.mozGetUserMedia ||
								navigator.msGetUserMedia);
		return (navigator.getUserMedia) ? true : false;
	}

};


KMG.WebCam = function() {

	var scope = this;
	
	navigator.getUserMedia = ( navigator.getUserMedia ||
								navigator.webkitGetUserMedia ||
								navigator.mozGetUserMedia ||
								navigator.msGetUserMedia);
	
	var tVideo = document.getElementById('kmg-video');
	var tCanvas = document.createElement( 'canvas' );
	var tCtx = tCanvas.getContext( '2d' );
	

	var wcStream = null;
	
	var webcamReady = false;
	
	this.onError = function(title, body) { 
		console.error("Error: " + title + ": " + body);
	}

	
	this.capture = function(onReady, onFail, toGreyscale) {
		
		if (!webcamReady) {
			onFail();
			return;
		}
		
		try {
			tCtx.drawImage(tVideo, 0, 0, tVideo.videoWidth, tVideo.videoHeight, 0, 0, tCanvas.width, tCanvas.height);
		} catch (ex) {
			scope.onError("Webcam Error", "Failed to capture webcam frame");
			return;
		}
		
		var img = new Image();
		img.onload = function() {
			onReady(img);
		};
		img.onabort = img.onerror = function() {
			onFail();
		};
		
		if (toGreyscale) {
			var data = tCtx.getImageData(0, 0, tCanvas.width, tCanvas.height);
			
			for(var n = 0; n < data.width * data.height; n++) {
				var index = n*4;
				var intesity = data.data[index+0] * 0.2989 + data.data[index+1] * 0.5870 + data.data[index+2] * 0.1140;
				
				data.data[index+0] = intesity;
				data.data[index+1] = intesity;
				data.data[index+2] = intesity;
			}
			
			tCtx.putImageData(data, 0, 0);
		}
		
		img.src = tCanvas.toDataURL('image/webp');

	};


	
	function gotStream( stream ) {
		
		wcStream = stream;
		
		if( typeof webkitURL !== 'undefined' && webkitURL.createObjectURL ) {
			tVideo.src = webkitURL.createObjectURL( stream );
		} else if( window.URL ) {
			tVideo.src = window.URL.createObjectURL( stream );
		} else {
			tVideo.src = stream;
		}
        
		tVideo.onerror = function () {
			stream.stop();
			scope.onError("Error", "Failed to initialize webcam");
		};

		tVideo.onloadedmetadata = function(e) {
			tCanvas.width = tVideo.videoWidth;
            tCanvas.height = tVideo.videoHeight;
		};
		
		webcamReady = true;
    }
	
	function noStream() {
		scope.onError("Error", "No camera available.");
	}
	
	this.isCameraAvailable = function() {
		return (navigator.getUserMedia) ? true : false;
	};
	
	this.isActive = function() {
		return webcamReady;
	};
	
	this.start = function() {
		if (navigator.getUserMedia) {
			navigator.getUserMedia( { 'video': true }, gotStream, noStream);
			console.info("Started video");
		} else {
			scope.onError("Error", "Cannot start video: no user media or no camera available");
		}
	};
	
	this.pause = function() {
		if (wcStream) {
			wcStream.stop();
			webcamReady = false;
			console.info("Stopped video");
		}
	};
};
