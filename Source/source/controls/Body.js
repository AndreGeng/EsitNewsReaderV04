enyo.kind({
	name: "hpit.controls.Body",
	fit: true,
	classes: "controls-body",
	components: [
		{kind: "Scroller", thumb: false, fit: true, touch: true, horizontal:"hidden", style: "margin: 0; height: 100%;", components: [
			{name: "client", style: "height: 100%;"}
		]}
	]
});