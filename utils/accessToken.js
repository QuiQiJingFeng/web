let commonUtils = require("./commonUtils");
let acccessToken = null;
let expires_time = null;
let APPID = "wx5f02af4819f5fe21";
let APPSECRET = "7be3cb42428142211f598946835dd3d2";
let querying = false;

exports.GetAccessToken = function(callBack){
	if(acccessToken){
		let now = Date.now();
		if(now < expires_time){
			callBack(acccessToken)
			return;
		}
	}
	// 如果当前正在刷新状态,则将其延迟1s再次请求
	if(querying){
		setTimeout(function(){
			this.GetAccessToken(callBack)
		},1);
		return;
	}

	querying = true;
	let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
	commonUtils.Request({url:url},function(error, response, body){
		if (!error && response.statusCode == 200) {

			let data = JSON.parse(body)
			if(data.errcode){
				console.log("errcode:",data.errcode)
				console.log("errmsg:",data.errmsg)
				querying = false;
				this.GetAccessToken(callBack)
			}else{
				acccessToken = data.access_token;
				expires_time = Date.now() + data.expires_in / 3 * 2
				querying = false;
				callBack(acccessToken)
			}
	    }else{
	    	console.log("error-->>",error)
	    	console.log("code-->",response.statusCode)
			querying = false;
			this.GetAccessToken(callBack)
	    }
	    
	})
}