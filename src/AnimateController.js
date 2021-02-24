
KMG.AnimateController = function ( config, object ) {
	
	this.config = config;
	this.object = object;
	var scope = this;
	
	this.current = config.integralStart;
	
	this.isActive = false;

	function nextDistance()
	{
		var rawDistance = scope.config.distanceIntegral(scope.current);
		var distance = ((scope.config.startDistance - scope.config.minDistance) * ((rawDistance - scope.config.integralMin) / (scope.config.integralMax - scope.config.integralMin))) + scope.config.minDistance;
		return distance;
	}
	
	function nextRotation()
	{
		var rawRotation = scope.config.rotateIntegral(scope.current);
		return rawRotation*(Math.PI/180.0);
	}
	
	function onNext(direction)
	{
		if (!scope.isActive) {
			return;
		}
		
		if (!direction) {
			direction = 1.0;
		}
		
		scope.current += (scope.config.speed * direction);
		var distance = nextDistance();
		var rotation = nextRotation() * direction;
		
		var position = scope.object.position;
		var offset = position.clone();
		
		var theta = Math.atan2( offset.x, offset.z );
		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		theta += rotation;
		phi += 0.0;
		
		offset.x = distance * Math.sin( phi ) * Math.sin( theta );
		offset.y = distance * Math.cos( phi );
		offset.z = distance * Math.sin( phi ) * Math.cos( theta );
	
		scope.object.position = offset;

		if (scope.current >= scope.config.integralEnd || scope.current <= scope.config.integralStart) {
			scope.stop();
		}
	}
	
	this.next = function() {
		onNext();
	};
	
	this.start = function() {
		this.isActive = true;
	};
	
	this.stop = function() {
		this.isActive = false;
	};
	
	
	this.rewind = function() {
		this.isActive = true;
		this.current = this.config.integralEnd;
		for (var i = this.config.integralEnd; i >= this.config.integralStart; i-=this.config.speed) {
			onNext(-1);
		}
		this.current = this.config.integralStart;
		this.isActive = false;
	};
};