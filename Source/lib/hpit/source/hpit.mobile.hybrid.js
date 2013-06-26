/**================================================================================
 * open url in browser plugin
 */
var BrowserOpenPlugin = {
    open: function(url, smsession, successCallback, failureCallback) {
        return cordova.exec(successCallback, failureCallback, "OpenBrowserWithCookiePlugin", "open", [url,smsession]);
    }
};

/**================================================================================
 * Shared Preferences Data Storage Plugin
 */

var NativeStoragePlugin = {
    get: function(key, successCallback, failureCallback) {
        return cordova.exec(successCallback, failureCallback, "SharedPreferencesDataStoragePlugin", "get", [key]);
    },
    put: function(key, value, successCallback, failureCallback) {
        return cordova.exec(successCallback, failureCallback, "SharedPreferencesDataStoragePlugin", "put", [key, value]);
    }
};

/**================================================================================
 * Device Type Plugin
 */

var DeviceTypePlugin = {
    get: function(successCallback, failureCallback) {
        return cordova.exec(successCallback, failureCallback, "DeviceTypePlugin", "", []);
    }
};
/**================================================================================
 * Device Id Plugin
 */

var GetDeviceIdPlugin = {
    get: function(successCallback, failureCallback) {
        return cordova.exec(successCallback, failureCallback, "GetDeviceIdPlugin", "get", []);
    }
};
/**================================================================================
 * Non Market Application Install setting Plugin
 */

var NonMarketAppInstallConfigPlugin = {
    get: function(successCallback, failureCallback) {
        return cordova.exec(successCallback, failureCallback, "NonMarketAppInstallConfigPlugin", "get", []);
    },
    set: function(successCallback, failureCallback) {
        return cordova.exec(successCallback, failureCallback, "NonMarketAppInstallConfigPlugin", "set", []);
    }
};
/**================================================================================
 * Email Sender Plugin
 */

var EmailSenderPhoneGapPlugin = {
    send: function(recipients, subject, text, successCallback, failureCallback) {
        return cordova.exec(successCallback, failureCallback, "EmailSenderPlugin", "send", [recipients, subject, text]);
    }
};
