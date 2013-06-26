/**
 * HP IT Mobility Framework 5.0
 * Copyright 2012 (c) HP
 *
 * Utility functions.
 */
hpLogin.Utils={
    /**
     * <p>Gets the String that is nested in between two Strings.
     * Only the first match is returned.</p>
     */
    substringBetween: function(str, open, close){
        if(str && open && close){
            var openIndex = str.indexOf(open);
            if(openIndex >= 0){
                var closeIndex = str.indexOf(close, openIndex+open.length);
                if(closeIndex > 0) {
                    return str.substring(openIndex+open.length, closeIndex);
                }
            }
        }
        return "";
    },
    //Considering security, only display first 8 and last 8 characters of SMESSSION
    truncateSMSESSION: function (inSession){
        if(inSession && inSession.length>8){
            return inSession.substring(0,8)+"..."+inSession.substring(inSession.length-8);
        } else {
            return inSession;
        }
    },
    isNumeric: function(inObj){
        return !isNaN(parseFloat(inObj)) && isFinite(inObj);
    },
    trim: function(inText){
        var text = inText || "";
        return text.replace(/^\s+|\s+$/g, "");
    },
    isFunction: function(inObj){
        var getType = {};
        return inObj && getType.toString.call(inObj) == '[object Function]';    
    },
    isArray: function(inObj){
        var getType = {};
        return inObj && getType.toString.call(inObj) == '[object Array]';
    },
    isString: function(inObj){
        var getType = {};
        return inObj && getType.toString.call(inObj) == '[object String]';
    }
};