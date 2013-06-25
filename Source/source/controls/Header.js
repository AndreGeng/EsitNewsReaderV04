enyo.kind({
	name: "hpit.controls.Header",
	components: [
		{kind: "FittableColumns", noStretch: true, classes: "controls-header onyx-toolbar onyx-toolbar-inline", style: "white-space: nowrap;padding:0px !important;", components: [
			{name: "client", fit: true, classes: "controls-header-title"}
		]}
	]
});