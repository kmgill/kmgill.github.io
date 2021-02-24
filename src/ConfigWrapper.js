
/** A very simple structure for creating property name aliases.
 *
 */
KMG.ConfigWrapper = function ( config ) {
	
	var scope = this;
	var config = config;
	var nameToPropMap = {};
	var propToNameMap = {};
	this.changeListener = null;
	
	this.add = function ( name, prop ) {
		propToNameMap[prop] = name;
		nameToPropMap[name] = prop;
		
		Object.defineProperty(this, name, {
			get : function()  { return config[nameToPropMap[name]]; },
			set : function(v) { 
				config[nameToPropMap[name]] = v;
				if (scope.changeListener) {
					scope.changeListener(nameToPropMap[name], v);
				}
			}
		});
		
	};
};
