
//
// mimoLive Stream Deck plugin
// Property Inspector (GUI on the Stream Deck config application)
//

// global vars
let websocket = null,
    uuid = null,
    actionInfo = {};

// connect to stream deck
function connectElgatoStreamDeckSocket(inPort, inUUID, inRegisterEvent, inInfo, inActionInfo) {
    uuid = inUUID;

    actionInfo = JSON.parse(inActionInfo);
    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function () {
        const json = {
            event:  inRegisterEvent,
            uuid:   inUUID
        };

        websocket.send(JSON.stringify(json));
        requestSettings();
    }

    websocket.onmessage = function (evt) {
        const jsonObj = JSON.parse(evt.data);
        if (jsonObj.event === 'sendToPropertyInspector') {
            const payload = jsonObj.payload;
            if (payload.error) {
                return;
            }

            const apisrv = document.getElementById('apisrv');
            apisrv.value = payload.apisrv;
            if(apisrv.value == "undefined") { apisrv.value = ""; }

            const apiurl = document.getElementById('apiurl');
            apiurl.value = payload.apiurl;
            if(apiurl.value == "undefined") { apiurl.value = ""; }
            
            const apicmd = document.getElementById('apicmd');
            apicmd.value = payload.apicmd;
            if(apicmd.value == "undefined") { apicmd.value = ""; }

            revealPropertyInspector()
        }
    };
}

// enable gui elements in stream deck
function revealPropertyInspector() {
    const el = document.querySelector('.sdpi-wrapper');
    el && el.classList.remove('hidden');
    updateEndpoints();
}

// actions
function requestSettings() {
    if (websocket) {
        let payload = {};
        payload.type = "requestSettings";
        const json = {
            "action": actionInfo['action'],
            "event": "sendToPlugin",
            "context": uuid,
            "payload": payload,
        };
        websocket.send(JSON.stringify(json));
    }
}

function updateSettings() {
    if (websocket) {
        const apisrv = document.getElementById('apisrv');
        const apiurl = document.getElementById('apiurl');
        const apicmd = document.getElementById('apicmd');

        let payload = {};
        payload.type = "updateSettings";
        payload.apisrv = apisrv.value;
        payload.apiurl = apiurl.value;
        payload.apicmd = apicmd.value;
        const json = {
            "action": actionInfo['action'],
            "event": "sendToPlugin",
            "context": uuid,
            "payload": payload,
        };
        websocket.send(JSON.stringify(json));
    }
    updateEndpoints();
}

function selectEndpoint() {
	document.getElementById('apiurl').value = document.getElementById('apiurlsel').value;
	updateSettings();
}

function updateEndpoints() {
	const apiurlsel = document.getElementById('apiurlsel');
	while (apiurlsel.firstChild) {
		apiurlsel.removeChild(apiurlsel.firstChild);
	}
	var el = document.createElement("option");
	el.textContent = "";
	el.value = "";
	apiurlsel.appendChild(el);
	
	var apisrvtemp = document.getElementById('apisrv').value;
	if (apisrvtemp.slice(-1) == "/") { apisrvtemp = apisrvtemp.substr(0, apisrvtemp.length-1); }
	const apisrv = apisrvtemp;
	const apidocs = apisrv+"/api/v1/documents?include=data.attributes,data.links&fields[attributes]=name&fields[links]=self";
	const request1 = new XMLHttpRequest();
	request1.onreadystatechange = function () {
		if(request1.readyState === XMLHttpRequest.DONE) {
			if (request1.status == 200) {
				if (request1.responseText.includes("\"data\"")) {
					var json = JSON.parse(request1.responseText);
					if (json.data != null) {
						for (i=0; i<json.data.length; i++) {
							if (json.data[i].links != null && json.data[i].links.self != null && json.data[i].attributes != null && json.data[i].attributes.name != null) {
								var apidocurl = json.data[i].links.self;
								var apidocname = json.data[i].attributes.name;
							
								var el = document.createElement("optgroup");
								el.label = apidocname;
								apiurlsel.appendChild(el);
							
								const apilays = apisrv+apidocurl+"/layers?include=data.attributes,data.links&fields[attributes]=name&fields[links]=self";
								const request2 = new XMLHttpRequest();
								request2.onreadystatechange = function () {
									if(request2.readyState === XMLHttpRequest.DONE) {
										if (request2.status == 200) {
											if (request2.responseText.includes("\"data\"")) {
												var json = JSON.parse(request2.responseText);
												if (json.data != null) {
													for (i=0; i<json.data.length; i++) {
														if (json.data[i].links != null && json.data[i].links.self != null && json.data[i].attributes != null && json.data[i].attributes.name != null) {
															var apilayurl = json.data[i].links.self;
															var apilayname = json.data[i].attributes.name;

															var el = document.createElement("option");
															el.textContent = apilayname;
															el.value = apilayurl;
															apiurlsel.appendChild(el);							
														}
													}
												}
											}
										}
									}
								};
								request2.open("GET", apilays);
								request2.send();
								
								const apilayssets = apisrv+apidocurl+"/layer-sets?include=data.attributes,data.links&fields[attributes]=name&fields[links]=self";
								const request3 = new XMLHttpRequest();
								request3.onreadystatechange = function () {
									if(request3.readyState === XMLHttpRequest.DONE) {
										if (request3.status == 200) {
											if (request3.responseText.includes("\"data\"")) {
												var json = JSON.parse(request3.responseText);
												if (json.data != null) {
													for (i=0; i<json.data.length; i++) {
														if (json.data[i].links != null && json.data[i].links.self != null && json.data[i].attributes != null && json.data[i].attributes.name != null) {
															var apilayurl = json.data[i].links.self;
															var apilayname = json.data[i].attributes.name;

															var el = document.createElement("option");
															el.textContent = apilayname;
															el.value = apilayurl;
															apiurlsel.appendChild(el);							
														}
													}
												}
											}
										}
									}
								};
								request3.open("GET", apilayssets);
								request3.send();	
							}
						}
					}
				}
			}
		}
	};
	request1.open("GET", apidocs);
	request1.send();
}

