
KMG.ObjectRotator = function(context, object, rotationSpeed) {
	KMG.BaseObject.call( this );
	var scope = this;
	this.rotationSpeed = rotationSpeed;
	this.object = object;
	
	var active = false;
	
	context.objects.push(this);
	
	function rotateObject(obj) {
		obj.rotation.y += (rotationSpeed*(Math.PI/180.0));
	}
	
	
	this.stop = function() {
		active = false;
	};
	
	this.start = function() {
		active = true;
	};
	
	this.update = function()
	{
		if (active) {
			if (object instanceof Array) {
				for (var i = 0; i < object.length; i++) {
					rotateObject(object[i]);
				}
			} else {
				rotateObject(object);
			}
		}
	};
};
KMG.ObjectRotator.prototype = Object.create( KMG.BaseObject.prototype );



KMG.PeriodObjectRotator = function(context, object, rotationalPeriod, tickController) {
	KMG.BaseObject.call( this );
	var scope = this;
	this.rotationalPeriod = rotationalPeriod;
	this.tickController = tickController;
	this.object = object;

	context.objects.push(this);

	
	this.update = function()
	{

		var rotation = ((this.tickController.tickJulian - this.tickController.getEpoch()) % this.rotationalPeriod) * 360 * (Math.PI / 180);
		if (!isNaN(rotation)) {
			if (object instanceof Array) {
				for (var i = 0; i < object.length; i++) {
					object[i].rotation.y = rotation;
				}
			} else {
				object.rotation.y = rotation;
			}
		}
		
		

	};
};
KMG.PeriodObjectRotator.prototype = Object.create( KMG.BaseObject.prototype );

