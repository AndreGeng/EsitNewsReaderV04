/**
* HP IT Mobility Framework v6.0.0
* Copyright 2012 (c) HP
*
*/

/**================================================================================
 * HP Login
 */
var hpLogin = (function(){
    /*----------------------------------------
     * Private Variables
     */
    var envName = "ITG"; //default
    var envList = {
            "DEV": {baseURL: "https://d9t0254g.houston.hp.com"},
            "ITG": {baseURL: "https://it-services-itg.external.hp.com"},
            "PROD": {baseURL: "https://it-services.external.hp.com"}
    };
    
    var hostnameToEnvName = {
        "d9t0254g.houston.hp.com":"DEV",
        "it-services-itg.external.hp.com":"ITG",
        "it-services.external.hp.com":"PROD",

        //Also include additional URLs in the list for the direct address of web servers, and even IIS servers on which this is hosted
        "d9w0602g.houston.hp.com": "DEV",
        "g9t1264g.houston.hp.com": "ITG",
        "g9w1488g.houston.hp.com": "ITG",
        "g9w1489g.houston.hp.com": "ITG",
        "g5t0608g.atlanta.hp.com": "PROD",
        "g6t0625g.atlanta.hp.com": "PROD",
        "g5w2688g.atlanta.hp.com": "PROD",
        "g6w2453g.atlanta.hp.com": "PROD"
    };
    
    

    
    var isAppWebBased = false;
    var isCordovaAvailable = !(typeof cordova === "undefined");
    var baseURL="";
    var loginURL="";
    var loginPostBody="action=__LOGINACTION__&user=__USERID__&password=__PASSWORD__&deviceos=__DEVICEOS__&devicetype=__DEVICETYPE__&deviceNDUID=__DEVICENDUID__&osType=__OSTYPE__";
    var logoutURL="__SRPBASEURL__/template.LOGOUT";
    var SRPBaseURL="";
    var targetURL="";

    var tagBeforeUserId="<TD>HTTP_SM_UNIVERSALID</TD><TD>";
    var tagAfterUserId="</TD></TR>";

    var loggedUser="";
    var smsession="";
    var smsessionTimestamp="";

    var initStatusEnum = {
            SIGNED_IN: 1,
            APP_CATALOG_NOT_INSTALLED: 2,
            NOT_SIGNED_BY_HPIT: 3,
            LOGIN_SESSION_NOT_FOUND: 4,
            LOGIN_SESSION_DATA_BROKEN: 5,
            SESSION_TIME_OUT: 6,
            SET_COOKIE_FROM_CLIENT_SUCCESS: 7,
            SET_COOKIE_FROM_CLIENT_FAILURE: 8,
            SIGNED_IN_FAILURE: 9,
            DEVICEID_NOT_FOUND:31,
            UNKNOWN_ERROR: 99
    };
    var loginFailureEnum = {
            INCORRECT_CREDENTIALS: 1,
            CONNECTION_TIMES_OUT: 2,
            USER_CANCELLED: 3,
            INTERNAL_ERROR: 9
    };
    var deviceId=""; //e.g. deviceId="e11aa9f0e8b0017e0664ce397fb5e83e027ee1d8";
    var osVersion=""; //e.g. osVersion="4.0.3";
    var deviceType=""; //e.g. for webOS, deviceType="Veer", for android, "Android_Phone" or "Android_Tablet";
    var osType=""; //Presently, we have OS type values 'Web Based', 'WebOS', 'iOS' and 'Android'.

    var initCallbacks=""; //holder for "args" passed to init method.
    var loginWithCredentialsCallbacks=""; //holder for "args" passed to loginWithCredentials method.
    var loginAction = ""; //call login.pl with "action=logon" or "action=logononly", login.pl wouldn't call DeclareDevice.
    var loginActionEnum = {"LOGON":"logon", "LOGON_ONLY": "logononly"};
    var logoutCallbacks=""; //holder for "args" passed to logout method.
    var initStatus="";
               
    //logging utility
    var logLevelEnum = {ERROR: "ERROR", INFO: "INFO", DEBUG: "DEBUG", DISABLED: "DISABLED"};//static variables
    var logAppenderEnum = {WEB_CONSOLE: "WEB_CONSOLE", WEB_STORAGE: "WEB_STORAGE"};//static variables
    var logLevel = logLevelEnum.DEBUG; //default level
    var logAppenders = [logAppenderEnum.WEB_CONSOLE];//default appenders

    var _checkIfWebBased = function(){
        var TAG = "hpLogin._checkIfWebBased - ";
        hpLogin.logd(TAG + "check current application is running from browser (web-based) or native (hybrid).");
        isAppWebBased = (0 === window.location.protocol.indexOf("http"));        
        hpLogin.logi(TAG + "isAppWebBased="+isAppWebBased + ", isCordovaAvailable="+isCordovaAvailable);
    };

    var _setupEnv = function () {
        var TAG = "hpLogin.init: _setupEnv - ";
        var myEnv;
        if (isAppWebBased) {
            var hostname = window.location.hostname;
            var myEnvName = hostnameToEnvName[hostname];            
            myEnv = envList[myEnvName];
            envName = myEnvName;
        } else {
            //read env from local storage
            var storedEnvName = window.localStorage["hpLoginEnvName"] || "";
            hpLogin.logi(TAG + 'storedEnvName=' + storedEnvName);
            if (storedEnvName) {
                hpLogin.logd(TAG + 'Found stored env ' + storedEnvName);
                myEnv = envList[storedEnvName];
                if(myEnv && myEnv.baseURL){
                    envName = storedEnvName;//change env variable
                }
            } else {
                myEnv = envList[envName];
            }
        }

        if (!myEnv || !myEnv.baseURL) {
            hpLogin.logi(TAG + 'use default env "PROD".');
            myEnv = envList['PROD'];
            envName = "PROD";
        }
        hpLogin.logi(TAG + 'envName=' + envName);
        baseURL = myEnv.baseURL;
        loginURL = baseURL + "/auth/login.pl";
        SRPBaseURL = baseURL + "/mobility";
        targetURL = SRPBaseURL + "/headers.pl";
        hpLogin.logi(TAG + "loginURL=" + loginURL + ", SRPBaseURL=" + SRPBaseURL);

    };

    var _retrieveDeviceInfo = function() {
        var TAG = "hpLogin.init: _retrieveDeviceInfo() - isAppWebBased="+isAppWebBased+", ";
        //device info
        if(isAppWebBased || !isCordovaAvailable){
            var userAgent = navigator.userAgent;
            hpLogin.logi("hpLogin._retrieveDeviceInfo(): userAgent=" + userAgent);
           
            osType = _getOsTypeForWebBased();
            osVersion=_getOsVersionForWebBased();
            deviceType = _getDeviceTypeForWebBased();
            deviceId=_getDeviceIdForWebBased();
        } else {
            //osVersion
            osVersion=_getOsVersionForHybrid();

            //osType
            osType = _getOsTypeForHybrid();

            //deviceType
            _fetchDeviceTypeForHybrid();

            //deviceId
            _fetchDeviceIdForHybrid();

        }
         hpLogin.logi(TAG + "deviceId=" + deviceId + ", osVersion=" + osVersion + ", deviceType=" + deviceType + ", osType=" + osType);


    };
    var _getOsTypeForHybrid = function() {
        var supportedOSMapper = {
            'webOS':'WebOS',
            'palm':'WebOS',
            'Android':'Android',
            'iPhone':'iOS',
            'iPad':'iOS',
            'iPod':'iOS',
            'iPhone Simulator':'iOS',
            'iPad Simulator':'iOS',
            'iOS':'iOS'
        };
        return supportedOSMapper[device.platform] || "NonSupportedOS";
    };
    var _getOsTypeForWebBased = function() {
        var myOsType = "";
        var userAgent = navigator.userAgent;
        
        if (userAgent.indexOf("webOS")>-1 || userAgent.indexOf("hpwOS")>-1){
            //webOS
            myOsType = 'WebOS';
        } else if (userAgent.indexOf("Android")>-1) {
            //Android
            myOsType = 'Android';
        } else if (userAgent.indexOf("iPhone")>-1 || userAgent.indexOf("iPad")>-1 || userAgent.indexOf("iPod")>-1){
            //iOS
            myOsType = 'iOS';
        } else if (userAgent.indexOf("Windows NT")>-1){
            //Windows
            myOsType = 'Windows_non_Phone';
        } else { 
            //Any other
            myOsType="NonSupportedOS";
        }
        
        return myOsType;
    };
    //get fake information
    //FAKE_WebOS_2_2_1_Veer
    var _getDeviceIdForWebBased = function(){
        var fakeId = "FAKE_" + osType + "_" + osVersion + "_" + deviceType;
        //replace dot or blank character or slash with underscore
        return fakeId.replace(/\.|\s|\//g,"_");
    };
    //ios device id will be updated for each installation, need to be saved it in local storage.
    var _fetchDeviceIdForHybrid = function(){
        var TAG = "hpLogin._fetchDeviceIdForHybrid: ";
        deviceId=device.uuid;
        hpLogin.logi(TAG + "deviceId: "+deviceId);
        if("iOS"===osType){
            GetDeviceIdPlugin.get(
                function(r){
                    hpLogin.logi(TAG + "PhoneGap Plugin DeviceTypePlugin success: "+r);
                    deviceId = r;
                },
                function(e){
                    hpLogin.loge(TAG + "PhoneGap Plugin DeviceTypePlugin failure: "+e);
                        if("DEVICEID_NOT_FOUND"===e){
                            _fireInitDone(initStatusEnum.DEVICEID_NOT_FOUND);
                        } else{
                            _fireInitDone(initStatusEnum.UNKNOWN_ERROR);
                        }
                }
            );
        } else {
            if(!deviceId){
                setTimeout(function() {  
                     deviceId=device.uuid;
                     hpLogin.logi(TAG + "Retried to get device id after 1 second. deviceId=" + deviceId);
                     if(!deviceId){
                     setTimeout(function() {  
                                deviceId=device.uuid;
                                hpLogin.logi(TAG + "Retried to get device id after 2 seconds. deviceId=" + deviceId);
                                }, 1000);
                     }
                     }, 1000);
            }
        }
                              
    };

    var _fetchDeviceTypeForHybrid = function(){        
        var TAG = "hpLogin._fetchDeviceTypeForHybrid: ";
        if("Android"===osType){
            DeviceTypePlugin.get(
                function(inResult){
                    hpLogin.logi(TAG + "PhoneGap Plugin DeviceTypePlugin success: "+inResult);
                    deviceType = inResult;
                },
                function(e){
                    hpLogin.loge(TAG + "PhoneGap Plugin DeviceTypePlugin failure: "+e);
                }
            );
        } else {
            deviceType=_getDeviceTypeForWebBased();
        }
    };
    var _getDeviceTypeForWebBased = function(){
        var TAG = "hpLogin._getDeviceTypeForWebBased: ";
        var myDeviceType = "Web Based";
        var userAgent = navigator.userAgent;
        var userAgentArray = userAgent.split(" ");
        
        if (userAgent.indexOf("webOS")>-1 || userAgent.indexOf("hpwOS")>-1){
            //webOS device
            var device = userAgentArray[userAgentArray.length-1].toLowerCase();
            if(device.indexOf("emulator")>-1){
                myDeviceType = "Emulator";
            } else if(device.indexOf("desktop")>-1){
                myDeviceType = "Emulator";
            } else if(device.indexOf("pre")>-1){
                myDeviceType = "Pre";
            } else if(device.indexOf("pre/3.0")>-1){
                myDeviceType = "Pre3";
            } else if(device.indexOf("touchpad")>-1){
                myDeviceType = "TouchPad";
            } else if(device.indexOf("veer")>-1 || device.indexOf("p160una")>-1){
                myDeviceType = "Veer";
            }
        } else if(userAgent.indexOf("Android")>-1){
            //Android device
            var width = $(window).width();
            var height = $(window).height();
            hpLogin.logd(TAG + "width="+width+", height="+height);
            if(width < 720){
                myDeviceType="Android_Phone";
            } else {
                myDeviceType="Android_Tablet";
            }
        } else if(userAgent.indexOf("iPhone")>-1 || userAgent.indexOf("iPod")>-1) {
            myDeviceType = "iPhone";
        } else if(userAgent.indexOf("iPad")>-1) {
            myDeviceType = "iPad";
        }  else if(userAgent.indexOf("Windows NT 6.2")>-1) {
            myDeviceType = "Windows_any_device";
        }
        return myDeviceType;
    };
    //If OS is not webOS, "All OS" is returned. Otherwise, OS version is returned, such as 2.1.0
    //web-based AppCatalog 
    //   when run on WebOS => pass 'WebOS' as osType and guess the OS version level as 'deviceOS' and pass it to in the declaredevice()
    //   when run on Android => pass 'Android' and guess the OS version level and pass it to in the declaredevice()
    //   when run on IOS or any other  => pass NonSupportedOS as the OS type and All OS as the device OS

    var _getOsVersionForWebBased= function(){
        //Initialize user agent string.
        var userAgent = "";
        if (navigator && navigator.userAgent)
            userAgent = navigator.userAgent.toLowerCase();

        
        var myOSVersion = "";
        
        if (userAgent.indexOf("webos")>-1){
            //Run on Palm's line of webOS device===
            myOSVersion = hpLogin.Utils.substringBetween(userAgent,"webos/",";");
        } else if (userAgent.indexOf("hpwos")>-1){ 
            //Run on HP's line of WebOS devices
            //Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.4; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/234.76 Safari/534.6 TouchPad/1.0
            myOSVersion = hpLogin.Utils.substringBetween(userAgent,"hpwos/",";");
        } else if (userAgent.indexOf("android")>-1) {
            //Run on Android device===
            //Google Nexus: Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1
            //HTC: Mozilla/5.0 (Linux; U; Android 2.1-update1; de-de; HTC Desire 1.19.161.5 Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17
            myOSVersion = hpLogin.Utils.substringBetween(userAgent,"android",";");
        } else if (userAgent.indexOf("iphone")>-1 || userAgent.indexOf("ipad")>-1 || userAgent.indexOf("ipod")>-1) {
            //Run on iPhone/iPad/iPod device===
            //iphone: Mozilla/5.0 (iPhone; U; fr; CPU iPhone OS 4_2_1 like Mac OS X; fr) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148a Safari/6533.18.5
            //iPod: Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_1 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8G4 Safari/6533.18.5
            //iPad: Mozilla/5.0 (iPad; CPU OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko ) Version/5.1 Mobile/9B176 Safari/7534.48.3
            myOSVersion = hpLogin.Utils.substringBetween(userAgent,"iphone os "," ").replace(/_/g,".");
            if(!myOSVersion){
                myOSVersion = hpLogin.Utils.substringBetween(userAgent,"cpu os "," ").replace(/_/g,".");
            }
            if(myOSVersion === ""){
                myOSVersion = "1.0.0";
            }
        } else if (userAgent.indexOf("windows nt 6.2")>-1) {
            //Run on Windows 8/Windows Phone 8 device===
            //Windows 8: Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0) 
            //Windows Phone 8: Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; ARM; Touch; IEMobile/10.0
            myOSVersion = "8.0.0";
        } 
        
        if(myOSVersion){
            myOSVersion= hpLogin.Utils.trim(myOSVersion);
            
            //special handling for "2.1-update1" 
            if(myOSVersion.indexOf("-")>-1){
                myOSVersion.substring(0, myOSVersion.indexOf("-"));
            }
            //for example, 2.1 --> 2.1.0
            if(myOSVersion.split(".").length ==2)
                myOSVersion+=".0";
        } else {
            //===Run on any other===
            myOSVersion = "Undefined OS";
        }
        return myOSVersion;
    };

    var _getOsVersionForHybrid = function(){
        var deviceOS = device.version;

        // Keep only first numeric or dot characters (e.g. in webOS SDK, the version is like "2.1.0%20SDK"
        for (var i=0; i<deviceOS.length; i++) {
            var c = deviceOS.charAt(i);
            if (c !== '.' && (c < '0' || c > '9')) {
                // stop at invalid character
                deviceOS = deviceOS.substring(0, i);
            }
        }
    //for example, 2.1 --> 2.1.0
        if(deviceOS.split(".").length ==2)
            deviceOS+=".0";

        return deviceOS;
    };

    //Restore LoginSession from native storage.
    var _restoreLoginSession = function(){
        var TAG = "hpLogin.init: _restoreLoginSession - ";
        hpLogin.logd(TAG + "ENTRY");

        if (typeof NativeStoragePlugin === "undefined") {
            // Cordova shared storage plugin is NOT available.
            hpLogin.logd(TAG + "Cordova shared storage plugin is NOT available. window.localStorage will be used.");
            var myLoginSession = window.localStorage.getItem("LoginSession") || "";
            _restoreLoginSessionSuccess(myLoginSession);
        } else {
            NativeStoragePlugin.get("LoginSession",
                function (r) {
                    _restoreLoginSessionSuccess(r);
                },
                function (e) {
                    _restoreLoginSessionFailure(e);
                }
            );
        }
    };
    var _restoreLoginSessionFailure = function(inError) {
        var TAG = "hpLogin.init: _restoreLoginSessionFailure() - ";
        hpLogin.loge(TAG + "with detailed errors --> " + inError);
        if("APP_CATALOG_NOT_INSTALLED"===inError){
            _fireInitDone(initStatusEnum.APP_CATALOG_NOT_INSTALLED);
        } else if ("NOT_SIGNED_BY_HPIT"===inError){
            _fireInitDone(initStatusEnum.NOT_SIGNED_BY_HPIT);
        } else {
            _fireInitDone(initStatusEnum.UNKNOWN_ERROR);
        }
    };
    var _restoreLoginSessionSuccess = function(inResult){
        var TAG = "hpLogin.init: _restoreLoginSessionSuccess() - ";
        hpLogin.logd(TAG + "ENTRY");
        if(!inResult){
            hpLogin.logd(TAG + 'no "LoginSession" found.');
            return _fireInitDone(initStatusEnum.LOGIN_SESSION_NOT_FOUND);
        }

        var loginSession = JSON.parse(inResult);
        smsession = loginSession.SMSESSION || "";
        loggedUser = loginSession.loggedUser || "";
        smsessionTimestamp = loginSession.timestamp || "";
        hpLogin.logi(TAG + "loggedUser="+ loggedUser +", timestamp="+smsessionTimestamp + ", smsession="+hpLogin.Utils.truncateSMSESSION(smsession));

        if(_checkIfSessionTimesOut()){
            return _fireInitDone(initStatusEnum.SESSION_TIME_OUT, loggedUser);
        }

        if(smsession && loggedUser){
            _setCookie();
        } else {
            hpLogin.loge(TAG + 'Content of "LoginSession" is broken.');
            _fireInitDone(initStatusEnum.LOGIN_SESSION_DATA_BROKEN);
        }
    };
    var _checkIfSessionTimesOut = function(){
        var TAG = "hpLogin.init: _checkIfSessionTimesOut() - ";
        if(hpLogin.Utils.isNumeric(smsessionTimestamp)){
            var lastTime = new Date(smsessionTimestamp);
            var currentTime = new Date();
            var timeElapsedInHours = (currentTime - lastTime)/(1000*60*60);
            hpLogin.logd(TAG + "timeElapsedInHours="+timeElapsedInHours);
            if (timeElapsedInHours >= 1) {
                hpLogin.logi(TAG+"the elapsed time is GREATER than 1 hour.");
                return true;
            } else {
                hpLogin.logi(TAG+"the elapsed time is LESS than 1 hour.");
                return false;
            }
        } else {
            hpLogin.logi(TAG + "The timestamp is NOT numeric. This means there is no valid timestamp, we consider this as session time out.");
            return true;
        }
    };
    var _setCookie = function(){
        _setCookieFromServer();
    };
    var _setCookieFromServer = function(){
        var TAG = "hpLogin.init: _setCookieFromServer() - ";
        hpLogin.logd(TAG + "Entry");
        var requestURL = hpLogin.getBaseURL() + "/auth/checksession.pl";

        hpLogin.ajax.request({
            url: requestURL,
            method: "POST",
            body:{SESSIONSM:hpLogin.getSMSESSION()},
            callback: {success: setCookieFromServerSuccess, failure: setCookieFromServerFailure}
        });
    };
    var setCookieFromServerSuccess= function(inRequest, inResponse){
        var TAG = "hpLogin.setCookieSuccess - ";
        var myResponse = JSON.parse(inResponse);
        hpLogin.setLoggedUser(myResponse.userId || "");
        hpLogin.setSMSESSION(myResponse.SMSESSION || "");
        hpLogin.logi(TAG + "setCookieRequest.done() - loggedUser=" + hpLogin.getLoggedUser() + "; SMSESSION=" + hpLogin.Utils.truncateSMSESSION(hpLogin.getSMSESSION()));

        if (hpLogin.getLoggedUser() && hpLogin.getSMSESSION()) {
            hpLogin.logd(TAG + "setCookieRequest.done() - found loggedUser and SMSESSION --> User is signed in successfully, to refresh stored login session.");
            hpLogin._persistLoginSession();
            hpLogin._fireInitDone(hpLogin.getInitStatusEnum().SIGNED_IN, hpLogin.getLoggedUser());
        } else {
            hpLogin.logd(TAG + "setCookieRequest.done() - failure --> loggedUser or smsession is not found in response.");
            hpLogin._fireInitDone(hpLogin.getInitStatusEnum().SIGNED_IN_FAILURE);
        }
    };
    var setCookieFromServerFailure= function(inRequest, inResponse){
        var TAG = "hpLogin.setCookieFailure - ";
        hpLogin.loge(TAG + "setCookieRequest.fail() - status=" + inRequest.status + ", statusText="+inRequest.statusText+", inRequest=" + JSON.stringify(inRequest));
        hpLogin._fireInitDone(hpLogin.getInitStatusEnum().SIGNED_IN_FAILURE, hpLogin.getLoggedUser());
    };
    var _fireInitDone = function(inInitStatus, inUserId){
        var TAG = "hpLogin.init: _fireInitDone() - ";
        hpLogin.logi(TAG + "inInitStatus=" + inInitStatus + ", inUserId=" + inUserId);
        initStatus = inInitStatus;
        if (initCallbacks.done && hpLogin.Utils.isFunction(initCallbacks.done)) {
            hpLogin.logd(TAG + "callback function --> " + initCallbacks.done);
            var userId = inUserId || "";
            if(userId){
                initCallbacks.done(inInitStatus, userId);
            } else {
                initCallbacks.done(inInitStatus);
            }
        } else {
            hpLogin.logi(TAG + 'callback function "done" is not found.');
        }
    };
    
    // Login
    var _doLogin = function(userId, password){
        var TAG ="hpLogin.login: _doLogin() - ";
        hpLogin.logd(TAG + "ENTRY");
        hpLogin.logd(TAG + "deviceType="+hpLogin.getDeviceType()+", osVersion="+hpLogin.getOsVersion()+", deviceId="+hpLogin.getDeviceId()+", osType="+hpLogin.getOsType());
        var myPostBody = hpLogin.getLoginPostBody()
            .replace("__USERID__", encodeURIComponent(userId))
            .replace("__PASSWORD__",encodeURIComponent(password))
            .replace("__DEVICEOS__",encodeURIComponent(hpLogin.getOsVersion()))
            .replace("__DEVICETYPE__",encodeURIComponent(hpLogin.getDeviceType()))
            .replace("__DEVICENDUID__",encodeURIComponent(hpLogin.getDeviceId()))
            .replace("__OSTYPE__",encodeURIComponent(hpLogin.getOsType()))
            .replace("__LOGINACTION__",encodeURIComponent(loginAction));
        hpLogin.ajax.request({
            url: hpLogin.getLoginURL(),
            method: "POST",
            body:myPostBody,
            callback: {success: doLoginCallSuccess, failure: doLoginCallFailure}
        });

        hpLogin.logd(TAG + "loginURL="+hpLogin.getLoginURL());
    };
    var doLoginCallSuccess = function (inXhr, inResponseText) {
        var TAG = "hpLogin.loginCallSuccess - ";
                 
        var myLoggedUser = hpLogin.Utils.substringBetween(inResponseText, hpLogin.getTagBeforeUserId(), hpLogin.getTagAfterUserId()) || "";
        hpLogin.setLoggedUser(myLoggedUser);
        var mySMSESSION = hpLogin.Utils.substringBetween(inXhr.getResponseHeader("Set-Cookie"), "SMSESSION=", ";") || hpLogin.Utils.substringBetween(inResponseText, "SMSESSION</TD><TD>", "</TD>");
        hpLogin.setSMSESSION(mySMSESSION);
        hpLogin.logi(TAG + "loginRequest.done() --> loggedUser="+myLoggedUser+"; SMSESSION="+hpLogin.Utils.truncateSMSESSION(mySMSESSION));

        if (myLoggedUser && mySMSESSION) {
            hpLogin.logi(TAG + "loggedUser and SMSESSION are found in response. --> User signed in successfully. To refresh stored LoginSession");
            hpLogin._persistLoginSession();
            hpLogin._fireLoginSuccess(myLoggedUser);
        } else {
            hpLogin.logi(TAG + "loginRequest.done() - login failure --> loggedUser or smsession is not found in response.");
            hpLogin._fireLoginFailure(hpLogin.getLoginFailureEnum().INCORRECT_CREDENTIALS, "");
        }
    };
    var doLoginCallFailure = function (inXhr, inResponseText) {
        var TAG = "hpLogin.loginCallFailure - ";
        hpLogin.logi(TAG + "loginRequest.fail() - inXhr.status=" + inXhr.status+", inXhr="+ JSON.stringify(inXhr));

        var reason;
        if(inXhr.status===0){
            reason = hpLogin.getLoginFailureEnum().CONNECTION_TIMES_OUT;
        } else if (inXhr.status===401){
            reason = hpLogin.getLoginFailureEnum().INCORRECT_CREDENTIALS;
        } else {
            reason = hpLogin.getLoginFailureEnum().INTERNAL_ERROR;
        }

        hpLogin._fireLoginFailure(reason, "");
    };
    var _fireLoginSuccess = function(userId){
        if (loginWithCredentialsCallbacks.success && hpLogin.Utils.isFunction(loginWithCredentialsCallbacks.success)) {
            hpLogin.logi("hpLogin._fireLoginSuccess(): login success --> userId="+ userId+", call back: "+loginWithCredentialsCallbacks.success);
            loginWithCredentialsCallbacks.success(userId);
        }
    };

    var _fireLoginFailure = function(reason, userId){
        if (loginWithCredentialsCallbacks.failure && hpLogin.Utils.isFunction(loginWithCredentialsCallbacks.failure)) {
            hpLogin.logi("hpLogin._fireLoginFailure(): login failure --> userId=" + userId+ ", call back: "+loginWithCredentialsCallbacks.failure);
            loginWithCredentialsCallbacks.failure(reason, userId);
        }
    };

    // Logout   
    var _doLogout = function(){
        var TAG ="hpLogin._doLogout - ";
        hpLogin.logd(TAG + "ENTRY");
        var myLogoutURL = hpLogin.getLogoutURL().replace("__SRPBASEURL__",hpLogin.getSRPBaseURL());
        hpLogin.logd(TAG + "logoutURL="+myLogoutURL);        
        hpLogin.ajax.request({
            url: myLogoutURL,
            method: "GET",
            callback: {success: _doLogoutCallSuccess, failure: _doLogoutCallFailure}
        });        
    };
    var _doLogoutCallSuccess = function(inXhr, inResponseText){
        var TAG = "hpLogin._doLogoutCallSuccess - ";
        hpLogin.logi(TAG + "inXhr.status=" + inXhr.status+", inXhr="+ JSON.stringify(inXhr));
        _fireLogoutDone(hpLogin.getLoggedUser());
    };
    var _doLogoutCallFailure = function(inXhr, inResponseText){
        var TAG = "hpLogin._doLogoutCallFailure - ";
        hpLogin.logi(TAG + "inXhr.status=" + inXhr.status+", inXhr="+ JSON.stringify(inXhr));
        _fireLogoutDone(hpLogin.getLoggedUser());
    };
    var _fireLogoutDone = function(userId){
        if (logoutCallbacks && logoutCallbacks.done && hpLogin.Utils.isFunction(logoutCallbacks.done)) {
            hpLogin.logi("hpLogin.logout(): done --> userId=" + userId+ ", call back: "+logoutCallbacks.done);
            logoutCallbacks.done(userId);
        }
    };

    var _persistLoginSession = function(){
        var TAG = "hpLogin.persistLoginSession(): ";
        smsessionTimestamp = new Date().getTime();
        var loginSession = {"SMSESSION": smsession, "timestamp": smsessionTimestamp, "loggedUser": loggedUser};
        hpLogin.logd(TAG + "smsession=" + hpLogin.Utils.truncateSMSESSION(smsession) + ", loggedUser=" + loggedUser);

        if (typeof NativeStoragePlugin === "undefined") {
            // Cordova shared storage plugin is NOT available.
            hpLogin.logd(TAG + "Cordova shared storage plugin is NOT available. window.localStorage will be used.");
            // Empty SMSESSION and timestamp for web storage
            loginSession.SMSESSION = "";
            loginSession.timestamp = "";
            window.localStorage.setItem("LoginSession", JSON.stringify(loginSession));
        } else {
            NativeStoragePlugin.put("LoginSession", JSON.stringify(loginSession),
                function (r) {
                    hpLogin.logd(TAG + "success - " + r);
                },
                function (e) {
                    hpLogin.loge(TAG + "failure - " + e);
                }
            );
        }
        
    };

    var _openUrlWithSSOAfterInit = function(inURL){
        var TAG = "hpLogin._openUrlWithSSOAfterInit(): ";
        if(smsession && smsessionTimestamp && !_checkIfSessionTimesOut()){
            hpLogin.logd(TAG + "SMSESSION is valid --> Open with PhoneGap plugin.");
            var requestURL = baseURL + "/auth/checksession.pl?targeturl="+encodeURIComponent(inURL);
            BrowserOpenPlugin.open(encodeURI(requestURL), smsession,
                function(r){
                    hpLogin.logd(TAG + "PhoneGap Plugin open success: "+r);
                },
                function(e){
                    hpLogin.loge(TAG + "PhoneGap Plugin open failure: "+e);
                    window.open(inURL);
                }
            );
        }else{
            hpLogin.logd(TAG + "SMSESSION is NOT valid --> Directly open in new window.");
            window.open(inURL);
        }
    };

    //Logging Utility
    var _log = function(message, level){
        _appendLog({"t": new Date().toUTCString(), "m": message, "l": level});
    };
    var _appendLog = function(msgJSON){
        for(var i=0; i<logAppenders.length;i++){
            var logAppender = logAppenders[i];
            if(logAppender===logAppenderEnum.WEB_CONSOLE){
                if(window.console){
                    console.log(msgJSON.m);
                }
            } else if (logAppender===logAppenderEnum.WEB_STORAGE){
                _appendLogToWebStorage(msgJSON);
            }
        }
    };
    var _appendLogToWebStorage = function(msgJSON){
        var loggedMessages = window.sessionStorage.getItem("hpit-mobile-log");
        if(loggedMessages){
            loggedMessages = JSON.parse(loggedMessages);
        } else {
            loggedMessages=[];
        }
        loggedMessages.push(msgJSON);
        window.sessionStorage.setItem("hpit-mobile-log", JSON.stringify(loggedMessages));
    };

    var _refreshSMSESSION = function(inXhr){
        var TAG = "hpLogin._refreshSMSESSION - ";
        
        var mySMSESSION = hpLogin.Utils.substringBetween(inXhr.getResponseHeader("Set-Cookie"), "SMSESSION=", ";") || "";
        if (mySMSESSION) {
            hpLogin.setSMSESSION(mySMSESSION);
            hpLogin.logd(TAG + "_refreshSMSESSION() - SMSESSION is found in response --> " + hpLogin.Utils.truncateSMSESSION(smsession) + ". To refresh stored LoginSession");
            hpLogin._persistLoginSession()
        } else {
            hpLogin.logd(TAG + '_refreshSMSESSION() - SMSESSION is NOT found in response.');
        }       
    };
    
    //Public Variables and Methods
    return {
        //Device Info
        getDeviceId: function(){
            return deviceId;
        },
        getDeviceType: function(){
            return deviceType;
        },
        getOsVersion: function(){
            return osVersion;
        },
        getOsType: function(){
            return osType;
        },

        //Env Info
        getBaseURL: function(){
            return baseURL;
        },
        getSRPBaseURL: function(){
            return SRPBaseURL;
        },
        getTargetURL: function(){
            return targetURL;
        },
        //Login Info
        getInitStatusEnum: function(){
            return initStatusEnum;
        },
        getLoginFailureEnum: function(){
            return loginFailureEnum;
        },
        getLoggedUser: function(){
            return loggedUser;
        },
        setLoggedUser: function(inLoggedUser){
            loggedUser = inLoggedUser;
        },
        getEnv: function(){
            if (!baseURL) { // HPLogin isn't initialized yet ==> retrieve last env info from local storage
                _setupEnv();
            }
            return envName;
        },
        getInitStatus: function(){
            return initStatus;
        },
        getSMSESSION: function(){
            return smsession;
        },
        setSMSESSION: function(inSMSESSION){
            smsession = inSMSESSION;
        },
        isAppWebBased: function(){
            return isAppWebBased;
        },
        getLoginPostBody: function(){
            return loginPostBody;
        },
        getLoginURL: function(){
            return loginURL;
        },
        getLogoutURL: function(){
            return logoutURL;
        },
        getTagBeforeUserId: function(){
            return tagBeforeUserId;
        },
        getTagAfterUserId: function(){
            return tagAfterUserId;
        },
        getLoginActionEnum: function() {
            return loginActionEnum;
        },
                              
        /*-----------------------------------------------------------------------------------------------
         * Public login API: init({done: doneCallback})
         * 
         * Description:
         *     Initialize HP mobility login & SSO framework (e.g. check if user is already signed-in in another application)
         *
         * Input Parameters:
         *     - doneCallback: function(isSignedIn, userId)
         *         - isSignedIn = Status indicator telling the calling application if there is an active session or not (either because the user isn’t signed-in or if there was any kind of error)
         *         - userId = email of user currently signed-in OR of user who last signed-in
         */
        init: function(args) {
            var TAG = "hpLogin.init(): ";

            initCallbacks = args;

            _setupEnv();

            _retrieveDeviceInfo();

            _restoreLoginSession();

            hpLogin.logd("hpLogin.init(): EXIT");
        },
        setEnv: function(inEnvName){
            var TAG = "hpLogin.setEnv: ";
            hpLogin.logd(TAG+"inEnvName="+inEnvName);
            if(inEnvName){

                hpLogin.logd(TAG+"Update environment setup");
                window.localStorage.setItem("hpLoginEnvName", inEnvName);
                _setupEnv();
                smsession="";
                hpLogin.logd(TAG + "Cleanup SMSESSION from local storage.");
                _persistLoginSession();
            }
        },

        /*-----------------------------------------------------------------------------------------------
         * Public login API: loginWithCredentials(userId, password, {success: successCallback(userId), failure: failureCallback(reason, userId)})
         * 
         * Description:
         *     Login with credentials (userId and password) provided by caller. Store SiteMinder session cookie to allow SSO between applications.
         *
         * Input Parameters:
         *     - userId = email of user provided by caller
         *     - password = password of user provided by caller
         *     - successCallback: function(userId)
         *         - userId = email of user currently signed-in
         *     - failureCallback: function(reason, userId)
         *         - reason = reason of failure, such as connection times out or userId/password is not correct.
         *         - userId = email entered in User Id login form
         *
         */
        loginWithCredentials: function(userId, password, args){
            var TAG ="hpLogin.login: loginWithCredentials() - ";
            hpLogin.logd(TAG + "ENTRY");

            loginWithCredentialsCallbacks = args;
            loginAction = args.action || hpLogin.getLoginActionEnum().LOGON;//logon or logononly (wouldn't call DeclareDevice)
            if(userId && password){
                _doLogin(userId, password);
            } else {
                _fireLoginFailure(loginFailureEnum.INCORRECT_CREDENTIALS, userId);
            }
        },

        /* --------------------------------------------------------------------------------
         * Public HPLogin API: logout({done: doneCallback(userId)})
         * 
         *    Description: 
         *        Sign out user, delete stored SiteMinder session cookie value
         *        
         *    Input Parameters:
         *        - doneCallback: function(userId)
         *            - userId = email of previously signed-in user
         */
        logout: function(args) {
            var TAG = "hpLogin.logout ";
            logoutCallbacks = args;
            smsession="LOGOUT";
            hpLogin.logd(TAG + "Set SMSESSION with value 'LOGOUT'. To refresh LoginSession storage.");
            _persistLoginSession();
            _doLogout();
        },

        openUrlWithSSO: function (inURL) {
            var TAG = "hpLogin.openUrlWithSSO(): ";
            hpLogin.logd(TAG + "Entry");

            if (isAppWebBased || osType == "NonSupportedOS" || !isCordovaAvailable) {
                hpLogin.logd(TAG + "SSO feature is not available. It will call window.open() to open the url");
                window.open(inURL);
                return;
            }
            
            if (!baseURL) { // HPLogin isn't initialized yet ==> retrieve last session info from local storage
                _setupEnv();
                
                NativeStoragePlugin.get("LoginSession",
                    function(inResult){
                        if (inResult) {
                            var loginSession = JSON.parse(inResult);
                            if (loginSession) {
                                smsession = loginSession.SMSESSION || "";
                                loggedUser = loginSession.loggedUser || "";
                                smsessionTimestamp = loginSession.timestamp || "";
                            }
                        }
                        _openUrlWithSSOAfterInit(inURL);
                    },
                    function(e){
                        _openUrlWithSSOAfterInit(inURL);
                    }
                );
            } else {  // HPLogin is initialized
                _openUrlWithSSOAfterInit(inURL);
            }
        },
        isLogDisabled: function(){
            return logLevel===logLevelEnum.DISABLED;
        },
        isErrorEnabled: function(){
            return (logLevel===logLevelEnum.DEBUG || logLevel===logLevelEnum.INFO || logLevel===logLevelEnum.ERROR);
        },
        isInfoEnabled: function(){
            return (logLevel===logLevelEnum.DEBUG || logLevel===logLevelEnum.INFO);
        },

        isDebugEnabled: function(){
            return logLevel===logLevelEnum.DEBUG;
        },
        loge: function(message){
            if(this.isErrorEnabled()){
                _log(message, "ERROR");
            }
        },
        logi: function(message){
            if(this.isInfoEnabled()){
                _log(message, "INFO");
            }
        },
        logd: function(message){
            if(this.isDebugEnabled()){
                _log(message, "DEBUG");
            }
        },
        getLogs: function(){
            return window.sessionStorage.getItem("hpit-mobile-log");
        },
        getLogLevelEnum: function(){
            return logLevelEnum;
        },
        getLogAppenderEnum: function(){
            return logAppenderEnum;
        },
        getLogLevel: function(){
            return logLevel;
        },
        getLogAppenders: function(){
            return logAppenders;
        },
        setLogLevel: function(inLogLevel){
            logLevel=inLogLevel;
            hpLogin.logd("hpLogin.setLogLevel: "+ logLevel);
        },
        setLogAppenders: function(inLogAppenders){
            logAppenders=inLogAppenders;
            hpLogin.logd("hpLogin.setLogAppenders: "+ logAppenders);
        },
        _preInit: function(){
            _checkIfWebBased();
        },
        _fireInitDone: _fireInitDone,
        _persistLoginSession: _persistLoginSession,
        _fireLoginSuccess: _fireLoginSuccess,
        _fireLoginFailure: _fireLoginFailure,
        refreshSMSESSION: _refreshSMSESSION
    };
})();

hpLogin._preInit();

