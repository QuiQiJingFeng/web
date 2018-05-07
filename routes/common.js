var crypto = require('crypto');
let moment = require('moment');
var https = require("https");
var iconv = require("iconv-lite");
moment().utcOffset(8);
let common = {};

common.encodeSearchParams = function(obj) {
    const params = []

    Object.keys(obj).forEach((key) => {
      let value = obj[key]
      if (typeof value === 'undefined') {
        value = ''
      }
      // 对于需要编码的文本（比如说中文）我们要进行编码
      params.push([key, encodeURIComponent(value)].join('='))
    })
  
    return params.join('&')
}

common.getClientIp = function(req) {
  return req.headers['x-forwarded-for'] ||  
  req.connection.remoteAddress ||  
  req.socket.remoteAddress ||  
  req.connection.socket.remoteAddress;  
}

common.getNowFormatTime = function() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

// 获取前一天的这个时间
common.getPreDayDateTime = function() {
  return moment().add(-24,'hours').format('YYYY-MM-DD HH:mm:ss');
}

common.convertTimeFromMysql = function(str){
  return moment(str, "YYYY-MM-DD HH:mm:ss Z").format("YYYY-MM-DD HH:mm:ss");
}


let platform_optioins = {
  ["weixin"] : {
      ["baseUrl"] : "https://api.weixin.qq.com/sns/auth?",
      ["link"] : { access_token : "token",openid : "uid"},
      ["method"] : "GET",
      ["checkArg"] : "errcode",
      ["checkValue"] : 0
  }
}
//TODO 
common.PlatformCheck = function(platform,uid,token,call_back) {
  if(platform == "mengya"){
    call_back();
    return;
  }
  let options = platform_optioins[platform];
  if (!options){
      call_back("unknown_platform");
      return;
  }
  let args = {uid:uid,token:token};

  let obj = {};
  let link = options.link;
  for(let key in link){
      let hkey = link[key];
      obj[key] = args[hkey];
  }
  let baseUrl = options.baseUrl;
  const finalUrl = `${baseUrl}?${common.encodeSearchParams(obj)}`;
  console.log(finalUrl);
  
  https.get(url, function (res) {  
        var datas = [];  
        var size = 0;  
        res.on('data', function (data) {  
            datas.push(data);  
            size += data.length;  
        //process.stdout.write(data);  
        });  
        res.on("end", function () {
            var buff = Buffer.concat(datas, size);  
            var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring  
            console.log(result);
            if (result[options[checkArg]] == options[checkValue]] ){
               call_back();
            }else{
              call_back("auth faild")
            }
        });  
    }).on("error", function (err) {
        console.log("FYD---->>>>>",err); 
    });  
}
 
common.hmacSH1 = function(content){
  var hmac = crypto.createHmac('sha1', 'FHQYDIDXIL1ZQL');
  hmac.update(content);
  return hmac.digest('hex');
}








module.exports = common;

