enyo.kind({
	name: "App",
	kind: "FittableRows",
	classes: "enyo-fit",
	components: [
		{kind: "hpit.controls.Spinner", name: "spinner", style:"z-index:1000;"},
		{kind: "hpit.controls.Scrim", name: "scrim"},
		{kind: "hpit.controls.Alert", name: "alert", showing: false},
		{name: "notifyHolder", classes: "toast-notifyHolder", showing: false},
		{kind: "Panels", name:"mainPanels", arrangerKind: "BoxTurnArranger", fit:true, realtimeFit: true, classes: "panels-sample-panels enyo-border-box", components: []}
	],

	create: function() {
		this.inherited(arguments);

		//Init the ViewLibrary and Utility
		ViewLibrary.bindPanelsControl(this.$.mainPanels);
		this.$.mainPanels.$.animator.setDuration(1000);
		Utility.bindAppMain(this);
		document.addEventListener("deviceready", this.onDeviceReady, false);
		GlobalVar.offlinelist = deserialize("offlineList");
	},

	rendered: function() {
		this.inherited(arguments);

		//Show the default view
		ViewLibrary.setView("HOME");
		Utility.hideScrim();
	},

	onDeviceReady: function(){
		document.addEventListener("backbutton", function(){
			serialize(GlobalVar.offlinelist, "offlineList");
			navigator.app.exitApp();
		}, false);
	}
});