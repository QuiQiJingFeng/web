var crypto = require('crypto');
let moment = require('moment');
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
  }
}
//TODO 
common.PlatformCheck = function(platform,uid,token,call_back) {
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
  //TODO
  call_back();
}

common.hmacSH1 = function(content){
  var hmac = crypto.createHmac('sha1', 'FHQYDIDXIL1ZQL');
  hmac.update(content);
  return hmac.digest('hex');
}








module.exports = common;

