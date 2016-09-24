/*app.js*/

'use strict';
var unirest = require('unirest');

/*set urls*/
var BASE_URL ="https://api.telegram.org/bot<token>/";
var POLLING_URL = BASE_URL + "getUpdates?offset=:offset:&timeout=60";
var SEND_MESSAGE_URL = BASE_URL + "sendMessage";

/*create recursive polling function*/
function poll(offset){
	var url = POLLING_URL.replace(":offset:",offset);

	unirest.get(url).end(function(response){
		var body = response.raw_body;
		if(response.status == 200){
			var jsonData = JSON.parse(body);
			var result = jsonData.result;

			if(result.length > 0){
				for (i in result){
					if (runCommand(result[i].message)) continue;
				}

				max_offset = parseInt(result[result.length - 1].update_id)+1;
			}
			poll(max_offset);
		}
	});
};

/* commands */
var dothis = function (message) {
	var caps = message.text.toUpperCase();
	var answer = {
		chat_id: message.chat.id,
		text: "You told me to do something, so I took your input made it all caps. Look:"+ caps
	};

	//send the message
	unirest.post(SEND_MESSAGE_URL)
	       .send(answer)
	       .end( function (response){
	       	 if (response.status == 200)
	       	 	console.log("Successfully sent message to " + message.chat.id);
	       });
	       
}

/* the COMMANDS object */
var COMMANDS = {
	"dothis" : dothis
};

/* create a map to map strings to actual functions */
function runCommand(message){
	var msgtext = message.text;

	if( msgtext.indexOf("/") != 0) return false; //no slash at the beginning

	var command = msgtext.substring(1, msgtext.indexOf(" "));// not a valid comand
    if (COMMANDS[command] == null) return false;

    COMMANDS[command] (message);
    return true;
}
