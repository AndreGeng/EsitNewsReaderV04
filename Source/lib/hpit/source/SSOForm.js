enyo.kind({
	name: "SSOForm",
	kind:"enyo.Control",
	layoutKind : "FittableRowsLayout",
	classes: "enyo-fit",
	
	events: {
		onLoginSuccess: "",
		onLoginFailure: ""
	},
	components:[
		{kind: "enyo.Scroller", style: "padding-top: 10px;",thumb: false,fit : true,touch: true, horizontal:"hidden", components:[
			{kind:"FittableColumns",components:[
	    		{tag: "div",classes: "div-background",style:"width:74px;height:74px;"},
	    		{tag: "div", content: "ES IT News Reader", style:"margin-left:10px;line-height:74px;", classes: "title-font"}
	    	]},
		    {style: "padding: 20px;", components: [
		    	{tag: "div", classes: "title-font", content: "Please sign in"},
		    	{tag: "div", classes: "regular-font", style:"margin-top:20px;", content: "Signing in gives you access to HP intranet and make ES IT News available which you can't get otherwise."},
			    {tag: "div",style: "color: #FF0000; padding: 10px 0px;", name: "hpLoginMessage"},
			    {tag: "div", style: "margin-bottom: 20px;", components: [
	        		{tag: "div", classes: "regular-font", content: "Username", style: "float: left;font-size:28px;"},
	        		{tag: "div", content: "*", style: "color:red;"}
	        	]},
	        	{style: "clear:both;"},
	        	{kind: "onyx.Groupbox", components: [
	        		{kind: "onyx.InputDecorator", components: [
		                {kind: "onyx.Input", style: "width: 100%;", name: "hpLoginEmail", type: "email"}
		            ]}
	        	]},
	        	{tag: "div", style: "margin-top: 10px;margin-bottom: 20px;", components: [
	        		{tag: "div", classes: "regular-font", content: "Password", style: "float: left;font-size:28px;"},
	        		{tag: "div", content: "*", style: "color:red;"}
	        	]},
	        	{style: "clear:both;"},
	        	{kind: "onyx.Groupbox", components: [
	            	{kind: "onyx.InputDecorator", components: [    
		            	{kind: "onyx.Input", style: "width: 100%;", type: "password", name: "hpLoginPassword"}
		        	]}
		        ]},
			    {kind: "FittableColumns", style: "margin-top:20px;", components:[
			    	{kind:"onyx.Button", classes: "red-bg hp-button", content: "Sign In", style: "float:right;", ontap: "signInClick"},
			    	{kind:"onyx.Button", classes: "gray-bg hp-button", content: "Cancel", style: "float:left", ontap: "cancelClick"}
			    ]}
		    ]}
		]}
	],
	create:function(){
		this.inherited(arguments);
	}, 
	rendered: function() {
	    this.inherited(arguments);
	    this.initEmailField();
	},
	initEmailField: function(){
		hpLogin.logd("hpLoginForm.initEmailField - Entry");
		var email = this.$.hpLoginEmail.hasNode().value;
		//This field is initialized only if the field is empty, so that if the form is displayed again, we keep the last value typed.
		if(!email){
			var lastLoggedUser = hpLogin.getLoggedUser();
			hpLogin.logd("hpLoginForm.init - lastLoggedUser="+lastLoggedUser);
			if(lastLoggedUser){
				this.$.hpLoginEmail.setValue(lastLoggedUser);
			}
		}
	},	
	//---------------------------------------
	// Sign-In and callback functions
	//---------------------------------------
	signInClick: function(){
		Utility.showScrim();

		this.setMessage("");

		console.log(hpLogin.getOsType());
		if(hpLogin.getOsType() == ""){
			this.loginWithCredentialsSuccess(email); 
			return true;
		}

	    var email = this.$.hpLoginEmail.hasNode().value;
	    var password = this.$.hpLoginPassword.hasNode().value;
    	hpLogin.logd("email="+email);
    	var callbacks = {
    			success: enyo.bind(this, "loginWithCredentialsSuccess"),
    			failure: enyo.bind(this, "loginWithCredentialsFailure")
    	}; 
    	
    	hpLogin.loginWithCredentials(email, password, callbacks); 		
	},
	loginWithCredentialsSuccess: function(userId){
		hpLogin.logd("hpLoginFormEnyo.loginSuccess - userId="+userId);
		
		//Erase the value of field hpLoginPassword after a successful login
		this.$.hpLoginPassword.setValue("");
		
		Utility.hideScrim();
		
		//Fire loginSuccess event
		this.doLoginSuccess({"userId":userId});
	},
	loginWithCredentialsFailure: function(reason, userId){
		hpLogin.logi("hpLoginFormEnyo.loginFailure - reason="+reason+", userId="+userId);
	    if(hpLogin.getLoginFailureEnum().CONNECTION_TIMES_OUT===reason){
	        this.setMessage('Sign-in times out. Please check your network connection and try again later.');
	    } else if (hpLogin.getLoginFailureEnum().INCORRECT_CREDENTIALS===reason){
	    	this.setMessage('Sign-in failed. Please check user name and password.');
	    } else {   
	    	this.setMessage('Sign-in failed. Unknown error.');
	    }		
	    
	    Utility.hideScrim();
	    
	    //Always fire loginFailure event
	    this.doLoginFailure({"reason": reason, "userId":userId});
	},
	cancelClick: function(){
		// hpLogin.logd("hpLoginForm.cancel - Entrty");
		// this.setMessage("");
		// //Fire loginFailure event with reason 'USER_CANCELLED'
		// this.doLoginFailure({"reason": hpLogin.getLoginFailureEnum().USER_CANCELLED, "userId":""});
		navigator.app.exitApp();
	},
	//----------------------------------------
	// Message
	//----------------------------------------
	setMessage: function(inMessage){
		this.$.hpLoginMessage.setContent(inMessage);
	}
});
