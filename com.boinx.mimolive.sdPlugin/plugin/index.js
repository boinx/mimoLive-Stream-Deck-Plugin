
//
// mimoLive Stream Deck plugin
// Plugin (script to handle Stream Deck button events)
//

// global vars
let websocket = null,
    pluginUUID = null,
    socket = {},
    reconnect = true,
    settingsCache = {};

// actions
const webhookAction = {
    type : "com.boinx.mimolive",

    onKeyDown : function(context, settings, coordinates, userDesiredState) {
    },

    onKeyUp : function(context, settings, coordinates, userDesiredState) {
    
    	// create api command
        settingsCache[context] = settings;
        let apisrv = "";
        if (settings != null && settings.hasOwnProperty('apisrv')){
            apisrv = settings["apisrv"];
			if (apisrv.slice(-1) == "/") { apisrv = apisrv.substr(0, apisrv.length-1); }
        }
        let apiurl = "";
        if (settings != null && settings.hasOwnProperty('apiurl')){
            apiurl = settings["apiurl"];
        }
        let apicmd = "";
        if (settings != null && settings.hasOwnProperty('apicmd')){
            apicmd = "/"+settings["apicmd"];
        }
        
        // execute api command
        if (apisrv == "" || apiurl == "") {
            this.ShowReaction(context, "Alert");
        } else {
            const url = apisrv+apiurl+apicmd+"?include=data.attributes&fields[attributes]=live-state";
            const request = new XMLHttpRequest();
            request.onreadystatechange = function () {
  				if(request.readyState === XMLHttpRequest.DONE) {
    				if (request.status == 200) {
    				
    					// create stream deck status
    					if (apiurl.includes("/layer-sets/")) {
							if (request.responseText.includes("\"active\":true")) {
								const json = {
									"event": "setState",
									"context": context,
									"payload": { "state": 0 }
								};
								websocket.send(JSON.stringify(json));
							} else {
								const json = {
									"event": "setState",
									"context": context,
									"payload": { "state": 1 }
								};
								websocket.send(JSON.stringify(json));
							}        					
    					} else {
							if (request.responseText.includes("\"live-state\":\"live\"")) {
								const json = {
									"event": "setState",
									"context": context,
									"payload": { "state": 0 }
								};
								websocket.send(JSON.stringify(json));
							} else {
								const json = {
									"event": "setState",
									"context": context,
									"payload": { "state": 1 }
								};
								websocket.send(JSON.stringify(json));
							}    					
    					}

			    	}
  				}
			};
            request.open("GET", url);
            request.send();
        }
        
    },

    onWillAppear : function(context, settings, coordinates) {
        settingsCache[context] = settings;
        let apisrv = "";
        if(settings != null && settings.hasOwnProperty('apisrv')){
            apisrv = settings["apisrv"];
        }
        let apiurl = "";
        if(settings != null && settings.hasOwnProperty('apiurl')){
            apiurl = settings["apiurl"];
        }
        if(apisrv == "" || apiurl == "") {
            this.ShowReaction(context, "Alert");
        }
		this.RefreshSocket(context);
    },

    RefreshSocket : function(context) {
    	if (settingsCache[context] != null) {
			let apisrv = "";
			if(settingsCache[context].hasOwnProperty('apisrv')){
				apisrv = settingsCache[context]["apisrv"];
				if (apisrv.slice(-1) == "/") { apisrv = apisrv.substr(0, apisrv.length-1); }
			}
			let apiurl = "";
			if(settingsCache[context].hasOwnProperty('apiurl')){
				apiurl = settingsCache[context]["apiurl"];
			}	

			if (apisrv != "" && apiurl != "") {
				let checkid = "";
				if (apiurl.includes("/layers/")) {
					checkid = apiurl.split("/layers/")[1];
					if (checkid.includes("/")) {
						checkid = apiurl.split("/")[0];
					}
				}
				if (apiurl.includes("/layer-sets/")) {
					checkid = apiurl.split("/layer-sets/")[1];
					if (checkid.includes("/")) {
						checkid = apiurl.split("/")[0];
					}
				}
			
				apisrvws = apisrv.replace("http://", "ws://");
				if (socket[context] != null) {
					reconnect = false;
					socket[context].close();
				}
				socket[context] = new WebSocket(apisrvws+"/api/v1/socket");
				socket[context].onopen = function () {
					websocket.send(JSON.stringify({ "event": "showOk", "context": context }));
					socket[context].send("{\"event\":\"ping\"}");
					setInterval(function() {
						if (socket[context].bufferedAmount == 0) {
							socket[context].send("{\"event\":\"ping\"}");
						}
					}, 5000);
				};
				socket[context].onmessage = function (event) {
				  if (event.data.includes(checkid)) {
				  	if (apiurl.includes("/layer-sets/")) {
						if (event.data.includes("\"active\":true")) {
							const json = {
								"event": "setState",
								"context": context,
								"payload": { "state": 0 }
							};
							websocket.send(JSON.stringify(json));
						} else {
							const json = {
								"event": "setState",
								"context": context,
								"payload": { "state": 1 }
							};
							websocket.send(JSON.stringify(json));					
						}
				  	} else {
						if (event.data.includes("\"live-state\":\"live\"")) {
							const json = {
								"event": "setState",
								"context": context,
								"payload": { "state": 0 }
							};
							websocket.send(JSON.stringify(json));
						} else {
							const json = {
								"event": "setState",
								"context": context,
								"payload": { "state": 1 }
							};
							websocket.send(JSON.stringify(json));					
						}
					}
				  }
				};
				socket[context].onclose = function (event) {
					websocket.send(JSON.stringify({ "event": "showAlert", "context": context }));
					if (reconnect) { this.RefreshSocket(context); }
					reconnect = true;
				};
				socket[context].onerror = function(error) {
					socket[context].close();
				};
			}				
		}
    },

    ShowReaction : function(context, type) {
        const json = {
            "event": "show" + type,
            "context": context,
        };
        websocket.send(JSON.stringify(json));
    },

    SetSettings : function(context, settings) {
        const json = {
            "event": "setSettings",
            "context": context,
            "payload": settings
        };
        websocket.send(JSON.stringify(json));
    },

    SendSettings : function(action, context) {
        const json = {
            "action": action,
            "event": "sendToPropertyInspector",
            "context": context,
            "payload": settingsCache[context]
        };
        websocket.send(JSON.stringify(json));
    }
};

// connect to stream deck
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    pluginUUID = inPluginUUID;

    websocket = new WebSocket("ws://localhost:" + inPort);

    function registerPlugin(inPluginUUID) {
        const json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };
        websocket.send(JSON.stringify(json));
    };

    websocket.onopen = function() {
        registerPlugin(pluginUUID);
    };

    websocket.onmessage = function (evt) {
        const jsonObj = JSON.parse(evt.data);
        const event = jsonObj['event'];
        const action = jsonObj['action'];
        const context = jsonObj['context'];
        const jsonPayload = jsonObj['payload'];

        if (event == "keyDown") {
            const settings = jsonPayload['settings'];
            const coordinates = jsonPayload['coordinates'];
            const userDesiredState = jsonPayload['userDesiredState'];
            webhookAction.onKeyDown(context, settings, coordinates, userDesiredState);
        } else if(event == "keyUp") {
            const settings = jsonPayload['settings'];
            const coordinates = jsonPayload['coordinates'];
            const userDesiredState = jsonPayload['userDesiredState'];
            webhookAction.onKeyUp(context, settings, coordinates, userDesiredState);
        } else if(event == "willAppear") {
            const settings = jsonPayload['settings'];
            const coordinates = jsonPayload['coordinates'];
            webhookAction.onWillAppear(context, settings, coordinates);
        } else if(event == "sendToPlugin") {
            if (jsonPayload['type'] == "updateSettings") {
                webhookAction.SetSettings(context, jsonPayload);
                settingsCache[context] = jsonPayload;
                webhookAction.RefreshSocket(context);
            } else if (jsonPayload['type'] == "requestSettings") {
                webhookAction.SendSettings(action, context);
            }
        }
    };
};

