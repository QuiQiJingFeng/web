/*
	服务器验证
	当更新服务器的时候,启动这个进行校验
*/

var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
let crypto = require('crypto');

var options = {
  key: fs.readFileSync('../certify/214659013730241.key'),
  cert: fs.readFileSync('../certify/public.pem')
}

var CheckServer = function(req,res){
    var paramaters =url.parse(req.url,true).query;
	let signature = paramaters.signature;
    let echostr = paramaters.echostr;
    let timestamp = paramaters.timestamp;
    let nonce = paramaters.nonce;
    let token = "lsj_game";

    let sha1 = crypto.createHash('sha1')
    let list = [token, timestamp, nonce];
    for (var key in list.sort()){
        sha1.update(list[key]);
    }
    let hashcode = sha1.digest('hex');
    console.log("handle/GET func: hashcode, signature: ", hashcode, signature)
    if(hashcode == signature)
        res.write(echostr)
    else
        res.write("")
    res.end();
}

http.createServer(function(req,res){
	CheckServer(req,res);
}).listen(3000);
https.createServer(options,function(req,res){
	CheckServer(req,res);
}).listen(4000);
