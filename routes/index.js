let express = require('express');
let router = express.Router();
var md5 = require('md5');
let mysql_pool = require('./mysql_pool.js');
var fs = require("fs");


/* param1  account  param2  password  result(success   成功 error   失败)*/
//账号登录
router.post('/login', function(req, res) {
     if (req.body.action == 'login') {
        let account = req.body.account;
        let password = req.body.password;
        if (!account || !password || !account.trim() || !password.trim()) return;

        mysql_pool.GetAccount(account, function(value){
            let response = {result : 'error'};
            data = value[0];
            if(data && data.password == md5(password)){
                response.result = 'success';
                res.cookie('login', account, { maxAge: COOKIE_TIMEOUT });
                res.cookie('group', data.group_id);
            }

            res.write(JSON.stringify(response));
            res.end();
        });
    }else{
        res.end();
    }
});
/* param1  account  param2  password  result(success   成功 error   失败)*/
//账号注册
router.post('/register', function(req, res) {
    if (req.body.action == 'register') {
        let account = req.body.account;
        let password = req.body.password;
        if (!account || !password || !account.trim() || !password.trim()) return;
        let response = {};
        mysql_pool.GetAccount(account, function(value){
                data = value[0];
                if(data) {
                    response.result = "account_exist";
                    res.write(JSON.stringify(response));
                    res.end();
                }else {
                    mysql_pool.RegisterAccount(account, md5(password),function(success) {
                        if(success) {
                            response.result = 'success';
                        }else {
                            response.result = "failer";
                        }
                        console.log(JSON.stringify(response));
                        res.write(JSON.stringify(response));
                        res.end();
                    });
                }
        });
    }else{
        res.end();
    }

});

/*
    ERROR CODE:
                0   代表订单成功
                -1  需加入恢复订单列表
                -2  重复的订单数据
                -3  参数错误
                -4  订单校验失败
                -5  in_app为空 需加入恢复订单列表 并通知客户端刷新StoreKit
*/
let PLATFORMS = {
    appstore : require('./appstore'),
    // google : require('./google'),
};
router.post('/check', function(req, res) {
    let res_json = {"errcode" : -1};

    let body = req.body;
    let platform = body.platform;
    //校验平台参数是否正确
    if(!PLATFORMS[platform]) {
        res_json.errcode = -3;
        res.write(JSON.stringify(res_json));

        return;
    }

    //以苹果收据的md5码作为订单的单号 可以防止重复的订单
    let trade_no = md5(body.receipt).toUpperCase();
    //校验重复订单
    mysql_pool.GetOrderState(trade_no, function(err, rows) {
        if(err){
            console.log("GetOrderState ERROR ",err);
            if(!req.client.destroyed) {
                res.write(JSON.stringify(res_json));
            }
            return;
        }else if(rows.length != 0) {
            res_json.errcode = -2;
            if(!req.client.destroyed) {
                res.write(JSON.stringify(res_json));
            }
            return;
        }else if(rows.length == 0) {
            //校验订单 分发到其他模块执行
            PLATFORMS[platform].Check(trade_no,body,res_json,res,req);
        }
    });
});

module.exports = router;
