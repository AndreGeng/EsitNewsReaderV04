enyo.kind({
	kind: "onyx.Popup",
	classes: "onyx-popup",
	name: "hpit.controls.Alert",
	scrim: true,
	centered: true,
	floating: true,
	classes: "controls-alert",
	published: {
		message: ""
	},
	components: [
		{kind: "FittableRows", classes:"enyo-center", components : [
			{style: "min-height: 40px", components: [
				{kind: "enyo.Control", name: "dialogMessage", allowHtml: true, classes: "controls-alert-message"}
			]},
			{style: "text-align: center", components: [
				{kind: "onyx.Button", classes: "onyx-blue", style:"width:95%;", content: "OK", onclick: "onOkayClicked" }
			]}
		]}
	],

	messageChanged: function() {
		this.$.dialogMessage.setContent(this.message);
	},

	onOkayClicked: function(inSender) {
		this.setShowing(false);
	}
});