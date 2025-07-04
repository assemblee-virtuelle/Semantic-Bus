(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function() {
    	return (root.W = factory());
    });
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.W = factory();
  }
}(this, function() {
// Prepare
var listeners = [],
	resize_trigger = false,
	orientationchange = false,
	orientationchange_trigger = false;

// Catch window resize event
if(window.addEventListener) {
	if('onorientationchange' in window) {
		orientationchange = true;
		window.addEventListener('orientationchange', function() {
			orientationchange_trigger = true;
		}, false);
	}
	window.addEventListener('resize', function() {
		resize_trigger = true;
	}, false);
}
else{
	window.attachEvent('onresize', function() {
		resize_trigger = true;
	});
}

// Verify resizes every 10ms
setInterval(function() {
	var trigger = false;
	if(orientationchange) {
		if(orientationchange_trigger && resize_trigger) {
			trigger = true;
		}
	}
	else if(resize_trigger) {
		trigger = true;
	}
	if(trigger && document.documentElement.clientWidth) {
		orientationchange_trigger = false;
		resize_trigger = false;
		for(var i=0, j=listeners.length; i<j; ++i) {
			listeners[i].func();
		}
	}
}, 10);

// Get screen orientation
function getOrientation() {
	var landscape;
	if('orientation' in window) {
		// Mobiles
		var orientation = window.orientation;
		landscape = (orientation == 90 || orientation == -90);
	}
	else {
		// Desktop browsers
		landscape = window.innerWidth > window.innerHeight;
	}
	return landscape ? 'landscape' : 'portrait';
}

// Viewport resolution detection
function detectViewport(absolute) {
	// Detect screen size
	var screen_width = screen.width,
		screen_height = screen.height;
	if(getOrientation() == 'landscape' && screen_width < screen_height) {
		screen_width = screen.height;
		screen_height = screen.width;
	}
	// Absolute mode
	if(absolute) {
		return {
			width: screen_width,
			height: screen_height
		};
	}
	// Relative mode
	else {
		var w = window.innerWidth,
			h = window.innerHeight;
		if(!w || !h || w > screen_width || h > screen_height || w == 980) {
			w = window.outerWidth;
			h = window.outerHeight;
		}
		if(!w || !h || w > screen_width || h > screen_height) {
			w = screen.availWidth;
			h = screen.availHeight;
		}
		return {width: w, height: h};
	}
}

// Define W object
var W = {
	getViewportDimensions: function(absolute) {
		return detectViewport(absolute);
	},
	getViewportWidth: function(absolute) {
		return detectViewport(absolute).width;
	},
	getViewportHeight: function(absolute) {
		return detectViewport(absolute).height;
	},
	getOrientation: function() {
		return getOrientation();
	},
	addListener: function(func, key) {
		listeners.push({
			func: func,
			key: key
		});
		return func;
	},
	removeListener: function(key) {
		for(var i=0, j=listeners.length; i<j; ++i) {
			if(listeners[i].key == key) {
				listeners.splice(i, 1);
				break;
			}
		}
	},
	clearListeners: function() {
		listeners = [];
	},
	trigger: function(key) {
		for(var i=0, j=listeners.length; i<j; ++i) {
			if(typeof key == 'undefined' || listeners[i].key == key) {
				listeners[i].func();
			}
		}
	}
};

return W;
}));
