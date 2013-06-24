enyo.kind({
	name: "hpit.controls.BackButton",
	style: "margin: 0px",
	components: [
		{kind: "onyx.IconButton", name: "backButton", src: "assets/icon-back.png", ontap:"back"}
	],
	create: function() {
		this.inherited(arguments);

		this.$.backButton.setShowing(ViewLibrary.isBackable());
	},
	rendered: function() {
		this.inherited(arguments);
	},
	back: function() {
		ViewLibrary.back();
	}
});