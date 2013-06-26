enyo.kind({
	name: "App",
	kind: "FittableRows",
	classes: "enyo-fit",
	components: [
        {kind: "onyx.Spinner", classes: "app-spinner", name: "spinner"},
		{kind: "hpit.controls.Scrim", name: "scrim"},
		{kind: "hpit.controls.Alert", name: "alert", showing: false},
		{name: "notifyHolder", classes: "toast-notifyHolder", showing: false},
		{kind: "Panels", name:"mainPanels", arrangerKind: "BoxTurnArranger", draggable: false, fit:true, realtimeFit: true, classes: "panels-sample-panels enyo-border-box", components: []}
	],

	create: function() {
		this.inherited(arguments);

		//Init the ViewLibrary and Utility
		ViewLibrary.bindPanelsControl(this.$.mainPanels);
		this.$.mainPanels.$.animator.setDuration(1000);
		Utility.bindAppMain(this);
		GlobalVar.offlinelist = deserialize("offlineList");
	},

	rendered: function() {
		this.inherited(arguments);

		var loginView = ViewLibrary.setView("LOGIN");
		Utility.hideScrim();
        var userName = retrieveValue("SSOUserName");
        if(userName != null){
            loginView.$.hpLoginForm.$.hpLoginEmail.setValue(userName);
        }
	},

	onDeviceReady: function(){
		hpLogin.logd("hpLogin init...");
        hpLogin.setLogLevel(hpLogin.getLogLevelEnum().DEBUG);
        hpLogin.setLogAppenders([hpLogin.getLogAppenderEnum().WEB_CONSOLE, hpLogin.getLogAppenderEnum().WEB_STORAGE]);
        navigator.splashscreen.hide();
        var initStatusToTextCode = {
                "1":"SIGNED_IN",
                "2":"APP_CATALOG_NOT_INSTALLED",
                "3":"NOT_SIGNED_BY_HPIT",
                "4":"LOGIN_SESSION_NOT_FOUND",
                "5":"LOGIN_SESSION_DATA_BROKEN",
                "6":"SESSION_TIME_OUT",
                "7":"SET_COOKIE_FROM_CLIENT_SUCCESS",
                "8":"SET_COOKIE_FROM_CLIENT_FAILURE",
                "9":"SIGNED_IN_FAILURE",
                "99":"UNKNOWN_ERROR"
        }; 
        
        var that = this;
        hpLogin.init({
            done: function(status, userId){
                hpLogin.logd("status="+status+", userId="+userId);
                if(hpLogin.getInitStatusEnum().SIGNED_IN === status){
                    //1. Session already active for user XYZ (SIGNED_IN --> no need to ask user to sign in)
                } else if (hpLogin.getInitStatusEnum().SESSION_TIME_OUT === status){
                    //2. No active session (SESSION_TIME_OUT), but last logged user id is known
                    Utility.hideScrim();
                } else {
                    //3. Error (for all other status codes: display error code as number + text code)
                    Utility.hideScrim();
                } 
            }
        }); 
		document.addEventListener("backbutton", function(){
			serialize(GlobalVar.offlinelist, "offlineList");
			navigator.app.exitApp();
		}, false);
	}
});