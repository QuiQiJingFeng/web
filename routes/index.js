let express = require('express');
let router = express.Router();
let md5 = require('md5');
let mysql_pool = require('./mysql_pool.js');
let fs = require("fs");
let constant = require("./constant.js");
let util = require("util");
let common = require("./common.js");

router.route('/')
    .get(function(req, res) {
        if (req.cookies.login) {
            res.redirect('/index');
        } else {
            res.redirect('/login');
        }
    });
//登录界面
router.get('/login', function(req, res){
    res.sendfile("./views/index.html");
});

//主界面
router.get('/index', function(req, res){
    if (!req.cookies.login) {
        res.redirect('/login');
    }else{
        res.sendfile("./views/index.html");
    }
});

/*
    @account  账户
    @password 密码
    @login_type debug/release
    @platform   web/weixin
    @result   返回值   (true   成功 false   失败)
*/
router.post('/login', function(req, res) {
    let account = req.body.account;
    let password = req.body.password;
    let login_type = req.body.login_type;
    let platform = req.body.platform;
    let device_id = req.body.device_id || "";
    let device_type = req.body.device_type || "";
    if (!account || !password || !login_type || !platform) return;
    let user_ip = common.getClientIp(req);
    let user_name = req.body.user_name || account;
    let user_pic = req.body.user_pic || "";

    let response = {result:"success"};
    res.setHeader('Content-Type', 'application/json');
    console.log("|fyd  platform == >",platform);
    password = common.hmacSH1(password);
    
    if(platform == "web"){
        //如果是web登录  不需要初始化用户的信息,因为只用作后台操作
        let filter = util.format("`account` = %s and `password` = %s ",mysql_pool.Escape(account),mysql_pool.Escape(password));
        mysql_pool.Select("register",filter, function(err,rows){
            if(err){ 
                console.log(err);
                response.result = "interanl_error";
                response.error_code = constant.ERROR_CODE["10003"];
                res.send(response);
                return;
            }
            let data = rows[0];
            if(data){
                //登录成功,记下登录日志
                let now = common.getNowFormatTime();
                let info = {
                    user_id:data.user_id,user_ip:user_ip,account:account,
                    login_type:login_type,platform:platform,device_id:device_id,
                    device_type:device_type,time:now
                };
                mysql_pool.Insert("login",info,function(err,rows){
                    if(err){
                        console.log(err);
                        response.result = "interanl_error";
                        response.error_code = constant.ERROR_CODE["10005"];
                        res.send(response);
                        return;
                    }
                    res.cookie('login', account, { maxAge: 36000000 });
                    response.user_id = data.user_id;
                    response.token = common.hmacSH1(data.user_id.toString() + now.toString());
                    res.send(response);
                });
            }else{
                response.result = "register_first";
                res.send(response);
            }
        });
    }else{
        //如果是平台登录
        common.PlatformCheck(platform,account,password,function(err){
            if(err){
                console.log(err);
                response.result = "interanl_error";
                response.error_code = constant.ERROR_CODE["10004"];
                res.send(response);
                return;
            }
            
            //平台校验成功 不需要校验密码
            let filter = util.format("`account` = %s ",mysql_pool.Escape(account));
            mysql_pool.Select("register",filter, function(err,rows){
                if(err){
                    console.log(err);
                    response.result = "interanl_error";
                    response.error_code = constant.ERROR_CODE["10006"];
                    res.send(response);
                    return;
                }
                let user_ip = common.getClientIp(req);
                let data = rows[0];
                if(data){ 
                    let now = common.getNowFormatTime();
                    //登录成功,记下登录日志
                    let info = {
                        user_id:data.user_id,user_ip:user_ip,account:account,
                        login_type:login_type,platform:platform,device_id:device_id,
                        device_type:device_type,time:now
                    };
                    mysql_pool.Insert("login",info,function(err,rows){
                        if(err){
                            console.log(err);
                            response.result = "interanl_error";
                            response.error_code = constant.ERROR_CODE["10010"];
                            res.send(response);
                            return;
                        }
                        response.user_id = data.user_id;
                        response.token = common.hmacSH1(data.user_id.toString()+now.toString());
                        res.send(response);
                    });
                }else{
                    
                    let content = {
                        user_ip:user_ip,
                        group_id:constant["GROUP_TYPE"]["COMMAN_USER"],
                        account:account,password:password,login_type:login_type,platform:platform,time:"NOW()",
                    };

                    mysql_pool.Insert("register",content,function(err, info) {
                        if(err){
                            console.log(err);
                            response.result = "interanl_error"
                            response.error_code = constant.ERROR_CODE["10007"];
                            res.send(response);
                            return;
                        }

                        let now = common.getNowFormatTime();
                        //登录成功,记下登录日志
                        let login_data = {
                            user_id:info.insertId,user_ip:user_ip,account:account,
                            login_type:login_type,platform:platform,device_id:device_id,
                            device_type:device_type,time:now
                        }
                        mysql_pool.Insert("login",login_data,function(err,rows){
                            if(err){
                                console.log(err);
                                response.result = "interanl_error";
                                response.error_code = constant.ERROR_CODE["10011"];
                                res.send(response);
                                return;
                            }
                            let user_info = {
                                user_id:info.insertId,
                                user_name:user_name,
                                user_pic:user_pic,
                                user_ip:user_ip,
                                gold_num:0
                            };
                            //初始化用户的信息
                            mysql_pool.Insert("user_info",user_info,function(err, value) {
                                if(err){
                                    console.log(err);
                                    response.result = "interanl_error"
                                    response.error_code = constant.ERROR_CODE["10008"];
                                    res.send(response);
                                    return;
                                }
                                response.user_id = info.insertId;
                                response.token = common.hmacSH1(info.insertId.toString()+now.toString());
                                res.send(response);
                            });
                        });
                    });
                }
            })
        });
    }
});
/* 
    @function 注册账号
    @account   账户
    @password  密码
    @login_type debug/release
    @platform  web
    @result  (account_exist   success  interanl_error)
*/
/*
    group_id = 0 表示超级管理员用户
    group_id = 1 表示管理员用户
    group_id = 2 表示普通用户
*/
router.post('/register', function(req, res) {
    let account = req.body.account;
    let password = req.body.password;
    let login_type = req.body.login_type;
    let platform = req.body.platform;

    if (!account || !password || !login_type || !platform) return;
    password = common.hmacSH1(password);
    let response = {result:"success"};
    res.setHeader('Content-Type', 'application/json');
    let filter = util.format("`account` = %s ",mysql_pool.Escape(account));
    mysql_pool.Select("register",filter, function(err,rows){
        if(err){ 
            console.log(err);
            response.result = "interanl_error"
            response.error_code = constant.ERROR_CODE["10001"];
            res.send(response);
            return;
        }
        let data = rows[0];
        if(data){
            response.result = "account_exist";
            res.send(response);
            return;
        }
        let user_ip = common.getClientIp(req);
        let content = {
            user_ip:user_ip,
            group_id:constant["GROUP_TYPE"]["COMMAN_USER"],
            account:account,password:password,login_type:login_type,platform:platform,time:"NOW()",
        };

        mysql_pool.Insert("register",content,function(err, info) {
            if(err){
                console.log(err);
                response.result = "interanl_error"
                response.error_code = constant.ERROR_CODE["10002"];
                res.send(response);
                return;
            }
            res.send(response);
        });
    }); 
});

// 用户所有的操作请求都要经过这个中间件的验证,否则不予通过
/*
    所有用户的操作请求都是post形式
    参数必须包含user_id,token
*/
router.use('/operator/*', function (req, res, next) {
    let body = req.body;
    let token = body.token;
    let user_id = body.user_id;
    let response = {result:"success"};
    if(!token || !user_id){
      response.result = "error_paramater";
      res.send(response);
      res.end();
      return;
    }
    let filter = util.format("`user_id` = %s order by time desc limit 1",mysql_pool.Escape(user_id));
    mysql_pool.Select("login",filter, function(err,rows){
        if(err){
            console.log(err);
            response.result = "interanl_error";
            response.error_code = constant.ERROR_CODE["99999"];
            res.send(response);
            res.end();
            return;
        }
        let data = rows[0];
        if(data){
            let time = common.convertTimeFromMysql(data.time);
            let origin_token = common.hmacSH1(user_id.toString()+time);
            if(token != origin_token){
                response.result = "error_token";
                res.send(response);
                res.end();
                return;
            }
            next();
        }else{
            response.result = "error_request";
            res.send(response);
            res.end();
            return;
        }
    });
  
  });

router.post('/operator/get_room_list',function(req,res){
    let user_id = req.body.user_id;
    let response = {result : "success"};
    mysql_pool.SelectCreateOrJoinRoom(user_id,function(err,rows,error_code){
        if(err){
            response.result = "internal_error";
            response.error_code = error_code;
            res.send(response);
            res.end();
            return;
        }
        let in_room_id
        let state 
        for(let i = 0;i<rows.length;i++){
            let data = rows[i];
            if(data.player_list){
                let player_list = JSON.parse(data.player_list)
                for(let j = 0;j<player_list.length;j++) {
                    let obj = player_list[j];
                    if(obj.user_id == data.user_id){
                        in_room_id = data.room_id
                        state = data.state
                        break;
                    }
                }
            }
            delete data.player_list;
        }
        response.room_id = in_room_id;
        response.state = state
        response.room_list = rows;
        res.send(response);
        res.end();
    })
})

router.post('/operator/get_user_info',function(req,res){
    let user_id = req.body.user_id;
    let response = {result : "success"};
    let filter = util.format("`user_id` = %s ",mysql_pool.Escape(user_id));
    mysql_pool.Select("user_info",filter,function(err,rows,error_code){
        if(err){
            response.result = "internal_error";
            response.error_code = error_code;
            res.send(response);
            res.end();
            return;
        }
        let info = rows[0];
        if(info){
            for(let key in info){
                response[key] = info[key];
            }
            res.send(response);
        }else{
            response.result = "not_select_info";
            res.send(response);
        }
        res.end();
    });
})

router.post('/operator/get_server_list_by_type',function(req,res){
    let game_type = req.body.game_type;
    let response = {result : "success"};
    let filter = util.format("`game_type` = %s ",game_type.toString());
    mysql_pool.Select("room_servers",filter,function(err,rows,error_code){
        if(err){
            response.result = "internal_error";
            response.error_code = error_code;
            res.send(response);
            res.end();
            return;
        }
        response.server_list = rows
        res.send(response);
        res.end();
    });
})

router.post('/operator/get_server_by_id',function(req,res){
    let room_id = req.body.room_id
    if(!room_id) return;
    let response = {result : "success"};
    mysql_pool.SelectServerByRoomId(room_id,function(err,rows){
        if(err){
            response.result = "internal_error";
            response.error_code = error_code;
            res.send(response);
            res.end();
            return;
        }
        let data = rows[0];
        if(data){
            response.server_port = data.server_port;
            response.server_host = data.server_host;
        }else{
            response.result = "no_server_info"
        }
        
        res.send(response);
        res.end();
    });
})

router.post('/operator/get_replays',function(req,res){
    let user_id = req.body.user_id
    if(!user_id) return;
    let response = {result : "success"};
    mysql_pool.SelectReplaysByUserId(user_id,function(err,rows){
        if(err){
            response.result = "internal_error";
            response.error_code = error_code;
            res.send(response);
            res.end();
            return;
        }
        response.replays = rows;
        res.send(response);
        res.end();
    });
})

router.post('/alipay',function() {
})

router.get('/alipay',function() {
    
})


module.exports = router;
