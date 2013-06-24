/* Class for the panel views management */
ViewLibrary = {
    /* The control of Pannels */
    _panels: null,

    /* Views list */
    _views: null, 

    /* Count of loaded views */
    _panelCount: 0, 

    /* A history list of current views */
    _history: null, 

    initViewList: function() {
        this._views = [];
        this._history = [];

        /* Set the view library */
        this._views["HOME"] = {kindName: "hpit.views.HomeView"}; 
        this._views["DETAIL"] = {kindName: "hpit.views.DetailView"};
        this._views["OFFLINELIST"] = {kindName: "hpit.views.OffLineListView"};
        for(var key in this._views){
            /* If a view index equals -1, it means the view hasn't been loaded yet */
            this._views[key].index = -1;
        }
    },

    /* Bind the ViewLibrary with a Pannels control 
     * And init the list of views
    */ 
    bindPanelsControl: function(panels) { 
        this._panels = panels;

        this.initViewList();
    },

    getPanelCount: function(){
        return this._panelCount;
    },

    /* Function to change the current view
     *   For example: to load the home scene, use ViewLibrary.setView("HOME")
     *   To load the help scene, use ViewLibrary.setView("HELP")
    */
    setView: function(viewName) {
        var panels = this._panels;
        if(this._panels.getActive()){
            /* Save the current panel into history */
            this._history.push(panels.getIndex());
        }

        var view = this._views[viewName];
        if(view.index == -1){
            /* The view hasn't been loaded; Add a new panel to pannels */
            view.index = this._panelCount++;
            var newPanel = panels.createComponent({kind: view.kindName});
            newPanel.render();
            panels.reflow();
        }
        panels.setIndex(view.index);
        return panels.children[view.index == -1? 0: view.index];
    },

    isBackable: function() {
        return this._history.length > 0;
    },

    back: function() {
        if(this.isBackable()) {
            var index = this._history.pop();
            this._panels.setIndex(index);
        }
    }
    /*
    popViewsFromHistory: function(numItems) {
        this._container.popViewsFromHistory(numItems);
    },
    goBack: function() {
        this._container.goBack();
    },
    retryHandler: function() {
    	  this._container.retryHandler();
    },
    cleanup: function() {
    	this._container = null;
    	this._views = null;
    }*/
};
