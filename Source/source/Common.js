function serialize(localData, key) {
	var str = JSON.stringify(localData);
	window.localStorage.setItem(key, str);
}

function deserialize(key) {
	var str = window.localStorage.getItem(key);
	if(str == null){
		return new Array();
	}
	var localData = JSON.parse(str);
	if(localData == null) {
		localData = new Array();
	}
	return localData;
}

function retrieveValue(key){
	return window.localStorage.getItem(key);
}

function saveValue(key,value){
	window.localStorage.setItem(key, value);
}