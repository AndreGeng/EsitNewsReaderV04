onyx.customFloatingScrim = new onyx.FloatingLayer({name: "floatingScrim", classes: "customFloatingScrim"});
enyo.kind({
    name: "hpit.controls.Scrim",
    rendered: function() {
		this.inherited(arguments);
		this.setParent( onyx.customFloatingScrim );
		this.setStyles();
		// Render floating layer
		onyx.customFloatingScrim.render();
	},
	show: function() {
		onyx.customFloatingScrim.show();
	},
	hide: function() {
		onyx.customFloatingScrim.hide();
	},
	setStyles: function() {
		var computedStyle = getComputedStyle(document.body, null);
    	var yPos = parseInt(computedStyle["margin-top"], 10);
    	var xPos = parseInt(computedStyle["margin-left"], 10);
    	onyx.customFloatingScrim.applyStyle("height", (this.calcViewportSize().height + yPos) + "px");
	},
    calcViewportSize: function() {
		if (window.innerWidth) {
			var obj = {
				width: window.innerWidth,
				height: window.innerHeight
			};
			return obj;
		} else {
			var e = document.documentElement;
			
			return {
				width: e.offsetWidth,
				height: e.offsetHeight
			};
		}
	}
});