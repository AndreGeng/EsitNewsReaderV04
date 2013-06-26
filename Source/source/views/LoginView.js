enyo.kind({
    name: "hpit.views.LoginView",
    kind: "FittableRows",
	classes: "enyo-fit",

    components: [
        {kind: "hpit.controls.Body", name: "loginViewBody", components: [
            {name: "hpLoginForm", kind: "SSOForm", onLoginSuccess: "loginSuccessHandler", onLoginFailure: "loginFailureHandler"}
		]}
    ],

    create:function(){
        this.inherited(arguments);
        this.$.hpLoginForm.$.hpLoginEmail.setValue("");
        this.$.hpLoginForm.$.hpLoginPassword.setValue("");
    },

    loginSuccessHandler: function(inSender, inEvent){
        saveValue("SSOUserName", this.$.hpLoginForm.$.hpLoginEmail.getValue());
        ViewLibrary.setView("HOME");
    },
    
    loginFailureHandler: function(inSender, inEvent){
        hpLogin.logd("loginFailureHandler - caught 'onLoginFailure' event triggered by HpLoginForm. reason="+inEvent.reason+", userId="+inEvent.userId);
        if(hpLogin.getLoginFailureEnum().USER_CANCELLED===inEvent.reason){
            hpLogin.logd("loginFailureHandler - hide login form.")
        }
    }
})