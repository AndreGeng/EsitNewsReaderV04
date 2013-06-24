Utility = {
	_appMain: null,

	bindAppMain: function(appMain) {
		this._appMain = appMain;
	},

	showScrim: function() {
		if(this._appMain != null) {
			this._appMain.$.spinner.show();
    		this._appMain.$.scrim.show();
		}
	},

	hideScrim: function() {
		if(this._appMain != null) {
			this._appMain.$.spinner.hide();
    		this._appMain.$.scrim.hide();
		}
	},
	showToast: function(text) {
		Utility._appMain.$.notifyHolder.show();
		var toastObj = Utility._appMain.$.notifyHolder.createComponent({name: "notice", kind: "com.hpit.control.toast"},{owner:Utility._appMain.$.notifyHolder});
		toastObj.setNotifyCont(text);
        setTimeout(function(){
            Utility._appMain.$.notifyHolder.destroyClientControls();
            Utility._appMain.$.notifyHolder.hide();
        }, 3000);

        Utility._appMain.$.notifyHolder.render();
	},
	
	showAlert: function(message) {
		if(this._appMain != null) {
			this._appMain.$.alert.setMessage(message);
    		this._appMain.$.alert.show();
		}
	}
};