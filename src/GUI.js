/**
 * PlanetMaker JavaScript Controller API
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
 
KMG.TopLeft = "TL";
KMG.TopRight = "TR";
KMG.BottomLeft = "BL";
KMG.BottomRight = "BR";

KMG.Opened = 0;
KMG.Closed = 1;

//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
KMG.GUID = {

	guid : function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	}

};


KMG.OptionController = function(property, title, setValuesInterface, updateInterface) {

	var changeListeners = [];
	
	this.addChangeListener = function(changeListener) {
		changeListeners.push(changeListener);
		return this;
	};
	
	this.setValues = function(values) {
		if (setValuesInterface) {
			setValuesInterface(values);
		}
		return this;
	};
	
	this.update = function() {
		if (updateInterface) {
			updateInterface();
		}
		return this;	
	};
	
	this.onChange = function(oldValue, newValue) {
		
		for (var i = 0; i < changeListeners.length; i++) {
			changeListeners[i](property, title, oldValue, newValue);
		}
	
	};
	
	
	

};

/**
 * @class Provides an individual block of controllers. This is the base component as the user
 * will see it (though not the base in terms of the DOM). Individual controls will
 * be added to instances of this object.
 *
 * @param {string} title Title of the block
 * @param {Object} config Property object backing the controls
 * @param {function} changeListener Callback function fired when a control's value is modified by the user
 *
 * @member KMG
 */
KMG.Block = function ( title, config, changeListener ) {
	
	this.config = config;
	this.changeListener = changeListener;
	var scope = this;
	
	var expandState = KMG.Opened;
	
	var container = $("<div/>").addClass("control-outter-container");
	
	var id = KMG.GUID.guid();
	var element = $("<div/>");
	element.attr("id", id);
	element.addClass("control-container");
	element.appendTo(container);
	
	var expandIcon = $("<a/>").addClass("expand-icon")
							.attr("href", "#")
							.text("-")
							.attr("title", "Click to expand or retract")
							.click(function() { 
								scope.setExpandedState(
									(expandState == KMG.Opened) ? KMG.Closed : KMG.Opened
								);
							}).appendTo(element);
	
	element.append($("<div class='header-title'>" + title + "</div>"));

	var controlContainer = $("<div/>").addClass("inner-container").appendTo(element);

	var controlList = $("<ul/>");
	controlList.appendTo(controlContainer);
	
	var scrollBar = $("<div/>").addClass("control-container-scrollbar-vertical").appendTo(controlContainer);
	$("<hr/>").appendTo(scrollBar);
	
	var lastY = -1;
	var mouseDown = false;
	scrollBar.mousedown(function(e) {
		mouseDown = true;
		lastY = e.clientY;
		scrollBar.addClass("unselectable");
		//console.debug('Mouse Down');
	});
	
	$(document).mouseup(function(e) {
		mouseDown = false;
		scrollBar.removeClass("unselectable");
		//console.debug('Mouse Up');
	});
	
	controlList.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    };

	
	$(document).mousemove(function(e) {
		if (!mouseDown || (lastY <= e.clientY && !controlList.hasScrollBar())) {
			return;
		}
		e.preventDefault();
		var height = e.clientY - controlList.offset().top - 5;
		//console.debug("Setting height to " + height);
		controlList.css("height", height);
		
		lastY = e.clientY;
	});
	
	function fireChangeListener() {
		if (changeListener != null) {
			changeListener();
		}
	}
	
	this.getElement = function()
	{
		return container;
	}
	
	function isValueFloatingPoint(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
	/**
     * 
     * @param property
	 * @param title
	 * @param min
	 * @param max
	 * @param step
     */
	this.addRange = function(property, title, min, max, step) {
		if (!min)
			min = 0;
		if (!max) 
			max = 100;
		if (!step) 
			step = 1;
	
		var slider, text;
		
		var controller = new KMG.OptionController(property,
													title, 
													null, // Set Values
													function() { // Update
			
			text.val(config[property]);
			slider.slider({value:config[property]});
		});
		
		var onSlide = function( event, ui ) {
			var oldValue = config[property];
			config[property] = ui.value;
			text.val(ui.value);
			controller.onChange(oldValue, config[property]);
			fireChangeListener();
		};
	
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		slider = $("<div/>").attr("id", id)
				.addClass("slider-control")
				.slider({
					value : config[property],
					min : min,
					max : max,
					step : step,
					range : "min",
					slide : onSlide,
					change : onSlide
				})
				.appendTo(li);
		text = $("<input/>").attr("type", "text")
					.addClass("value-text")
					.css("width", "40px")
					.css("margin-left", "10px")
					.on('input', function(e) {

						var value = $(this).val();
						
						// If the user blanked the input, let them enter something new before we start messing with it
						if (value === "") {
							return;
						}
						
						// Validate that the input value is a number
						if (!isValueFloatingPoint(value)) {
							$(this).val(config[property]);
							return;
						}

						// Validate that the input value falls within proper ranges
						if (value < min) {
							value = min;
							$(this).val(value);
						} else if (value > max) {
							value = max;
							$(this).val(value);
						}
						
						slider.slider("value", value);
						fireChangeListener();
					}).val(config[property])
					.appendTo(li);
		li.appendTo(controlList);
		
		return controller;
	};
	

	
	/**
     * 
     * @param property
	 * @param title
	 * @param options
     */
	this.addSelect = function(property, title, options) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		var select = $("<select id='" + id + "'></select>").appendTo(li);
		
		var controller = new KMG.OptionController(property, title, function(values) {
			$(select).empty();
			$.each(values, function(key, value) {
				var option = $("<option/>").attr("value", value).text(value);
				if (value === config[property]) {
					option.attr("selected", "true");
				}
				option.appendTo(select);
			});
		});
		
		select.change(function(e) {
			var oldValue = config[property];
			config[property] = $(select).val();
			controller.onChange(oldValue, config[property]);
			fireChangeListener();
		});
		
		if (options) {
			controller.setValues(options);
		}
		li.appendTo(controlList);
		
		return controller;
	};
	
	/**
     * 
     * @param property
	 * @param title
     */
	this.addToggle = function(property, title) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		var oldValue;
		
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		var check = $("<input type='checkbox'/>").attr("id", id);
		if (config[property] === true) {
			check.attr("checked", "true");
		}

		var controller = new KMG.OptionController(property, title);
		
		check.click(function(e) {
			oldValue = config[property];
			config[property] = check.prop('checked');
			controller.onChange(oldValue, config[property]);
			//console.debug("Setting '" + property + "' to '" + config[property] + "'");
			fireChangeListener();
		});
		check.appendTo(li);
		
		li.appendTo(controlList);
		return controller;
	};
	
	/**
     * 
     * @param array
     */
	function arrayToColor(array)
	{
		var r = parseInt(array[0]);
		var g = parseInt(array[1]);
		var b = parseInt(array[2]);
		var rgb = "rgb("+r+","+g+","+b+")";
		return rgb;
	}
	
	// https://github.com/vanderlee/colorpicker
	/**
     * 
     * @param property
	 * @param title
     */
	this.addColor = function(property, title) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		$("<input/>").attr("id", id)
					.attr("type", "text")
					.val(arrayToColor(config[property]))
					.colorpicker({
						colorFormat : "RGB",
						color : arrayToColor(config[property]),
						ok: function(event, color) {
							config[property] = [color.rgb.r*255, color.rgb.g*255, color.rgb.b*255];
							//console.debug("Set '" + property + "' to '" + config[property] + "'");
							fireChangeListener();
						}
					}).appendTo(li);

		li.appendTo(controlList);
	};
	
	/**
     * 
     */
	function getLocalTimeZoneOffsetMillis()
	{
		var dt = new Date();
		return dt.getTimezoneOffset() * 60000;
	}
	
	// http://trentrichardson.com/examples/timepicker/
	/**
     * 
     * @param property
	 * @param title
     */
	this.addDateTime = function(property, title) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		
		var picker = $("<input/>").attr("type", "text")
								.attr("id", id)
								.datetimepicker({
									showButtonPanel: true,
									changeMonth: true,
									changeYear: true,
									yearRange : "c-25:c+25",
									onSelect : function(dateText, el) {
										config[property] = picker.datetimepicker('getDate').getTime();// - getLocalTimeZoneOffsetMillis();
										//console.debug("Setting '" + property + "' to '" + (new Date(config[property] - getLocalTimeZoneOffsetMillis())) + "'");
										fireChangeListener();
									}
								}).appendTo(li);
		if (config[property]) {
			picker.datetimepicker('setDate', (new Date(config[property])) );
		}
		
		li.appendTo(controlList);
	};
	
	
	
	/**
     * 
     * @param property
	 * @param title
     */
	this.addDate = function(property, title) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		
		$("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);
		
		var picker = $("<input/>").attr("type", "text")
								.attr("id", id)
								.datepicker({
									showButtonPanel: true,
									changeMonth: true,
									changeYear: true,
									yearRange : "c-25:c+25",
									onSelect : function(dateText, el) {
										config[property] = picker.datepicker('getDate').getTime() - getLocalTimeZoneOffsetMillis();
										//console.debug("Setting '" + property + "' to '" + (new Date(config[property] - getLocalTimeZoneOffsetMillis())) + "'");
										fireChangeListener();
									}
								}).appendTo(li);
		if (config[property]) {
			picker.datetimepicker('setDate', (new Date(config[property] + getLocalTimeZoneOffsetMillis())) );
		}
		
		li.appendTo(controlList);
	};
	
	/**
     * 
     * @param input
	 * @param label
	 * @param property
	 * @param validation
     */
	function onTextInput(input, label, property, validation) {
		var valid = true;
		if (validation && typeof validation === 'function' ) {
			valid = validation(input.val());
		} else if (validation && validation instanceof RegExp) {
			valid = validation.test(input.val());
		}
		if (valid) {
			input.removeClass('invalid-value-input');
			label.removeClass('invalid-value-label');
			config[property] = input.val();
		} else {
			input.addClass('invalid-value-input');
			label.addClass('invalid-value-label');
		}
	}
	
	/**
     * 
     * @param property
	 * @param title
	 * @param validation
     */
	this.addText = function(property, title, validation) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		
		var label = $("<label for='" + id + "'>"+title+"</label>").addClass("control-label").appendTo(li);

		var text = $("<input/>").attr("type", "text")
								.on('input', function(e) {
									onTextInput($(this), label, property, validation);
								}).val(config[property]).appendTo(li);
		
		li.appendTo(controlList);
		
		onTextInput(text, label, property, validation);
	};
	
	/**
     * 
     * @param title
	 * @param callback
     */
	this.addAction = function(title, callback) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");

		$("<button/>").text(title)
					.attr("id", id)
					.button()
					.click(function(e) {
						callback(e, $(this));
					}).appendTo(li);
		
		li.appendTo(controlList);
	};
	
	/**
     * 
     * @param href
	 * @param text
	 * @param title
     */
	this.addLink = function(href, text, title, target) {
		if (!title) {
			title = text;
		}
		if (!target) {
			target = "_self";
		}
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$("<a/>").text(text)
				.attr("id", id)
				.attr("href", href)
				.attr("title", title)
				.attr("target", target)
				.appendTo(li);
		
		li.appendTo(controlList);
	};

	/**
     * 
     * @param el
     */
	this.addElement = function(el) {
		var id = KMG.GUID.guid();
		var li = $("<li/>");
		$(el).appendTo(li);
		li.appendTo(controlList);
	};
	
	/**
     * 
     * @param anchor
	 * @param x
	 * @param y
     */
	this.setPosition = function(anchor, x, y) {
		switch(anchor[0]) {
		case "T":
			element.css("top", y);
			break;
		case "B":
			element.css("bottom", y);
			break;
		};
		
		switch(anchor[1]) {
		case "L":
			element.css("left", x);
			break;
		case "R":
			element.css("right", x);
			break;
		};
	};
	
	/**
     * 
     * @param visible
     */
	this.setVisible = function(visible) {
		element.css("display", (visible ? "inline-block" : "none"));
	};
	
	/**
     * 
     * @param state
     */
	this.setExpandedState = function(state) {
		expandState = state;
		if (state == KMG.Opened) {
			controlContainer.css("display", "inline-block");
			element.removeClass().addClass("control-container");
			controlContainer.addClass("inner-container");
			expandIcon.text("-");
		} else {
			controlContainer.css("display", "none");
			expandIcon.text("+");
		}
		
	};
	
};



/**
 * @class 
 *
 * @param {Object} config 
 * @param {function} changeListener
 *
 * @member KMG
 */
KMG.SideBar = function(config, changeListener, addClasses) {
	this.defaultConfig = config;
	this.defaultChangeListener = changeListener;
	var scope = this;
	
	var id = KMG.GUID.guid();
	var element = $("<div/>");
	element.attr("id", id);
	element.addClass("control-sidebar");
	//element.css("display", "inline");
	//element.css("position", "absolute");
	element.appendTo('body');
	
	for (var i = 0; i < addClasses.length; i++) {
		element.addClass(addClasses[i]);
	}
	
	/**
     * 
     * @param block
     */
	this.addBlock = function(block) {
		element.append(block.getElement());
	};
	
	this.removeBlock = function(block) {
		block.getElement().remove();
	};
	
	/**
     * 
     * @param title
	 * @param config
	 * @param changeListener
     */
	this.createBlock = function( title, config, changeListener ) {
		if (!config) {
			config = this.defaultConfig;
		}
		
		if (!changeListener) {
			changeListener = this.defaultChangeListener;
		}
		
		var block = new KMG.Block(title, config, changeListener);
		this.addBlock(block);
		return block;
	};
	

	
	
	/**
     * 
     * @param anchor
	 * @param x
	 * @param y
     */
	this.setPosition = function(anchor, x, y) {
		
		
		switch(anchor[0]) {
		case "T":
			//element.css("top", y);
			break;
		case "B":
			//element.css("bottom", y);
			break;
		};
		
		switch(anchor[1]) {
		case "L":
			element.addClass("control-sidebar-left");
			break;
		case "R":
			element.addClass("control-sidebar-right");
			break;
		};
		
	};
	
	/**
     * 
     * @param opacity
     */
	this.setOpacity = function(opacity) {
		element.css("opacity", opacity);
	};
	
	/**
     * 
     * @param visible
     */
	this.setVisible = function(visible) {
		element.css("display", (visible ? "inline-block" : "none"));
	};
	
	this.setHeight = function(height) {
		element.css("height", height);
	};
};


/**
 * @class 
 *
 * @param {Object} config 
 * @param {function} changeListener
 *
 * @member KMG
 */
KMG.GUI = function(config, changeListener) {

	
	var scope = this;
	
	this.onVisibilityChanged = null;
	
	this.left = new KMG.SideBar(config, changeListener, ["control-sidebar-left"]);
	this.right = new KMG.SideBar(config, changeListener, ["control-sidebar-right"]);
	
	this.left.setPosition("TL", "10px", "100px");
	this.right.setPosition("TR", "10px", "100px");
	
	var showGui = $("<div/>").addClass('control-show-gui')
							.css('display', 'none')
							.appendTo('#container');
	$("<a/>").attr("href", "#")
			.text('Show Controls')
			.on('click', function(e) {
				scope.setVisible(true);
			}).appendTo(showGui);
	
	function updateHeight() {
		scope.left.setHeight(($(window).height() - 100) + "px");
		scope.right.setHeight(($(window).height() - 100) + "px");
	}
	
	$(window).resize(function() {
		updateHeight();
	});
	updateHeight();
	
	
	/**
     * 
     * @param opacity
     */
	this.setOpacity = function(opacity) {
		this.left.setOpacity(opacity);
		this.right.setOpacity(opacity);
	};
	
	/**
     * 
     * @param visible
     */
	this.setVisible = function(visible, suppressShowBlock) {
		this.left.setVisible(visible);
		this.right.setVisible(visible);
		
		if (!suppressShowBlock) {
			showGui.css('display', (visible ? 'none' : 'inline-block'));
		}
		
		if (this.onVisibilityChanged) {
			this.onVisibilityChanged(visible);
		}
	};

	
};
