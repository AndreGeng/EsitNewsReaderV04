/**
 * HP IT Mobility Framework 5.0
 * Copyright 2012 (c) HP
 *
 * Directly using XMLHttpRequest to do Ajax calls. The implementation is inspired by EnyoJS.
 */
hpLogin.ajax={
    /**
     * ------------------------------------------------------------------------------
     * This is the public method for ajax calls.
     * <code>inParams</code> is an Object that may contain these properties:
     *         url: The URL to request (required).
     *         method: The HTTP method to use for the request. Defaults to GET.
     *         callback: Called when request is completed.
     *         body: Specific contents for the request body for POST method.
     *         headers: Request headers.
     * ------------------------------------------------------------------------------
     */
    request: function(inParams){
        var xhr = this._getXMLHttpRequest();

        var method=inParams.method || "GET";
        xhr.open(method, inParams.url, true);
        this._makeReadyStateHandler(xhr, inParams.callback);

        //set headers
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        if (inParams.headers) {
            for (var key in inParams.headers) {
                xhr.setRequestHeader(key, inParams.headers[key]);
            }
        }
        xhr.send(hpLogin.Utils.isString(inParams.body)?inParams.body:this._objectToQuery(inParams.body) || null);
        return xhr;
    },
    
    /**
     * ---------------------------------------
     * These are private methods
     * ---------------------------------------
     */
    _getXMLHttpRequest: function(){
        try {
            return new XMLHttpRequest();
        } catch (e) {}
        try {
            return new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {}
        try {
            return new ActiveXObject('Microsoft.XMLHTTP');
        } catch (e) {}
        return null;
    },
    _makeReadyStateHandler: function(inXhr, inCallback){
        inXhr.onreadystatechange = function() {
            if (inXhr.readyState == 4) {
                var success = inCallback.success;
                var failure = inCallback.failure;

                if(hpLogin.ajax._isFailure(inXhr)){
                    hpLogin.logd("_makeReadyStateHandler=> Failure");
                    failure && hpLogin.Utils.isFunction(failure) && failure(inXhr, inXhr.responseText);
                } else {
                    hpLogin.logd("_makeReadyStateHandler=> Success");
                    success && hpLogin.Utils.isFunction(success) && success(inXhr, inXhr.responseText);
                }
            }
        };
    },
    _objectToQuery: function(/*Object*/ map) {
        var enc = encodeURIComponent;
        var pairs = [];
        var backstop = {};
        for (var name in map){
            var value = map[name];
            if (value != backstop[name]) {
                var assign = enc(name) + "=";
                if (hpLogin.Utils.isArray(value)) {
                    for (var i=0; i < value.length; i++) {
                        pairs.push(assign + enc(value[i]));
                    }
                } else {
                    pairs.push(assign + enc(value));
                }
            }
        }
        return pairs.join("&");
    },
    _isFailure: function(inXhr) {
        console.log("inXhr  "+inXhr.status);
        return (inXhr.status < 200 || inXhr.status >= 300);
    }
};