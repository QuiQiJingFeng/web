let express = require('express');
let router = express.Router();
let md5 = require('md5');
let mysql_pool = require('./mysql_pool.js');
let fs = require("fs");
let constant = require("./constant.js");


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
    res.render('login.jade', {title:'QueQiJingFeng Console',account_text:'账户:',password_text:'密码:',btnLogin:'登录',btnRegister:'注册'});
});   
//主界面
router.get('/index', function(req, res){
    if (!req.cookies.login) {
        res.redirect('/login');
    }else{
        res.render('index.jade', {title:'QueQiJingFeng Console'});
    }
});
/*===================================LOGIC=====================================*/
/*
    @account  账户
    @password 密码
    @result   返回值   (true   成功 false   失败)
*/
//账号登录
function LoginCheck(account,password,call_back) {
    mysql_pool.GetAccount(account, function(value){
        data = value[0];
        if( data && data.password == md5(password) ) {
        call_back(true);
        }else{
            call_back(false);
        }
    });
}

router.post('/login', function(req, res) {
    let account = req.body.account;
    let password = req.body.password;
    if (!account || !password || !account.trim() || !password.trim()) return;

    LoginCheck(account,password,function(check) {
        let response = {result : 'error'};
        if(check){
            response.result = 'success';
            res.cookie('login', account, { maxAge: 36000000 });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
    });
});
/* 
    @account   账户
    @password  密码
    @result    返回值 param1:(true   成功 false   失败)  param2:(account_exist   success  failer)
*/
//账号注册
function RegisterAccount(account,password,call_back){
    mysql_pool.GetAccount(account, function(value){
            data = value[0];
            if(data) {
                call_back(false,"account_exist");
                return;
            }else {
                let group_id = constant["GROUP_TYPE"]["COMMAN_USER"];
                mysql_pool.RegisterAccount(account, md5(password),group_id,function(success) {
                    if(success) {
                        call_back(true,"success");
                    }else {
                        call_back(false,"failer");
                    }
                });
            }
    });
}

router.post('/register', function(req, res) {
    let account = req.body.account;
    let password = req.body.password;
    console.log("body = ",req.body);
    if (!account || !password || !account.trim() || !password.trim()) return;
    let response = {};
    RegisterAccount(account,password,function(check,message) {
        if(check){
            response.result = 'success';
            res.cookie('login', account, { maxAge: 36000000 });
        }else{
            response.result = message;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(response);
    });
});

module.exports = router;
