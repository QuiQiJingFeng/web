let request = require("request");
let assert = require("assert");

exports.Request = function(options,callBack){
	assert(options.url,"url must be none nil");
	options.method = options.method || "GET";
	options.json = options.json || false;
	options.headers = options.headers || {}
	if(options.json){
		options.headers["content-type"] = "application/json"
	}
	if(options.body){
		options.body = JSON.stringify(options.body)
	}
	request(options,callBack)
}

/*
	callBack:
	function(error, response, body) {
	    if (!error && response.statusCode == 200) {
	    }
	}
*/