
THREE.Vector3.prototype.rotateX = function (angle) {

	var cosX = Math.cos(angle);
	var sinX = Math.sin(angle);
			
	var ry = cosX * this.y + -sinX * this.z;
	var rz = sinX * this.y + cosX * this.z;
			
	this.y = ry;
	this.z = rz;
	
	return this;
};

THREE.Vector3.prototype.rotateY = function (angle) {

	var cosY = Math.cos(angle);
	var sinY = Math.sin(angle);
	
	var rx = cosY * this.x + sinY * this.z;
	var rz = -sinY * this.x + cosY * this.z;
	
	this.x = rx;
	this.z = rz;
	
	return this;
};

THREE.Vector3.prototype.rotateZ = function (angle) {

	var cosZ = Math.cos(angle);
	var sinZ = Math.sin(angle);
	
	var rx = cosZ * this.x + -sinZ * this.y;
	var ry = sinZ * this.x + cosZ * this.y;

	this.x = rx;
	this.y = ry;
	
	return this;
};


THREE.Vector3.prototype.rotate = function (angle, axis) {
	if (axis === undefined || axis === 'X') {
		return this.rotateX(angle);
	} else if (axis === 'Y') {
		return this.rotateY(angle);
	} else if (axis === 'Z') {
		return this.rotateZ(angle);
	}
	return this;
};
