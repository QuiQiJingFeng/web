
let commonUtils = require("./commonUtils");
let accessToken = require("./accessToken");

accessToken.GetAccessToken(function(token){
    console.log(token)
    let url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`
    let options = {url:url};
    options.method = "POST";
    options.json = true;
    options.body = {
                    button:[
                            {"type":"view","name":"在线论坛","url":"http:\/\/www.csdn.net","sub_button":[]},
                            {"type":"view","name":"在线论坛","url":"http:\/\/www.csdn.net","sub_button":[]},
                            {"type":"view","name":"在线论坛","url":"http:\/\/www.csdn.net","sub_button":[]}
                            ]
                    }

     commonUtils.Request(options,function(error, response, body){
        if (!error && response.statusCode == 200) {
            console.log(body);
        }else{
            console.log("ERROR-->>>",error)
        }
     })
})
