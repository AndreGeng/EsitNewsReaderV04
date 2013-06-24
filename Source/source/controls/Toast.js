enyo.kind({
	name: "com.hpit.control.toast",
    classes: "toast-notifybox",
    published: {
    	notifyCont: ""
    },
    components: [
    	{classes:"toast-notifyicon"},
    	{name: "notifyContent", content: "", classes: "notify-content", allowHtml: true}
    ],

    notifyContChanged: function() {
    	this.$.notifyContent.setContent(this.notifyCont);
    }
});