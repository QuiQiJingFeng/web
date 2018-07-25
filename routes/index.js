let express = require('express');
let router = express.Router();
let errorcode = require('./errorcode');
let accountcheck = require('./accountcheck');
let common = require('./common');
let async = require('async');

/*
    @account  账户
    @password 密码
    @recommend 推荐码
*/
router.post('/register', function(req, res) {
    let account = req.body.account;
    let password = req.body.password;
    let recommond = req.body.recommond
    let response = {code:errorcode["SUCCESS"]};
    if(!account || !password || !recommond){
        response.code = errorcode["INVALID_PARAMATER"]
        res.send(response)
        return;
    }
    password = common.hmacSH1(password);
    accountcheck.RegisterByRecommond(account,password,recommond,function(err,data){
        if(err){ console.log(err); res.send({code:err}); return;}
        if(data){response.data = data}
        res.send(response);
    })
});

router.post('/login',function(req,res){
    let account = req.body.account;
    let password = req.body.password;
    let response = {code:errorcode["SUCCESS"]};
    if(!account || !password){
        response.code = errorcode["INVALID_PARAMATER"]
        res.send(response)
        return;
    }
    password = common.hmacSH1(password);
    accountcheck.LoginByAccoutAndPassword(account,password,function(err,data){
        if(err){ console.log(err); res.send({code:err}); return;}
        if(data){response.data = data}
        res.send(response);
    })
})

router.use('/operator/*', function (req, res, next) {
    let body = req.body;
    let token = body.token;
    accountcheck.GetRegInfoByToken(token,function(err,data){
        if(err){ console.log(err); res.send({code:err}); return;}
        req.body["_info_"] = data;
        next();
    })
});

router.post('/operator/send_gold',function(req,res){
    let info = req.body["_info_"]
    let send_num = req.body.send_num
    let user_id = req.body.user_id
    let response = {code:errorcode["SUCCESS"]};
    if(!send_num || !user_id){
        response.code = errorcode["INVALID_PARAMATER"]
        res.send(response)
        return;
    }
    send_num = Math.abs(send_num)
    if(send_num == 0){
        response.code = errorcode["INVALID_PARAMATER"]
        res.send(response)
        return;
    }
    if(info.gold - send_num < 0){
        response.code = errorcode["GOLD_NOT_ENOUGH"]
        res.send(response)
        return;
    }
    accountcheck.SendGoldToUser(info.account,user_id,send_num,info.gold,function(err,data){
        if(err){ console.log(err); res.send({code:err}); return;}
        if(data){response.data = data}
        res.send(response);
    })
})

router.post('/operator/select_special_info',function(req,res){
    let user_id = req.body.user_id
    let response = {code:errorcode["SUCCESS"]};
    if(!user_id){
        response.code = errorcode["INVALID_PARAMATER"]
        res.send(response)
        return;
    }
    accountcheck.GetSpecialUserInfo(user_id,function(err,data){
        if(err){ console.log(err); res.send({code:err}); return;}
        if(data){response.data = data}
        res.send(response);
    })
})

 
module.exports = router;
