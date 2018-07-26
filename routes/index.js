let express = require('express');
let router = express.Router();
let errorcode = require('./errorcode');
let accountcheck = require('./accountcheck');
let common = require('./common');
let async = require('async');

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
    res.setHeader('Content-Type', 'text/html');
    res.sendfile("./views/login.html");
});

//主界面
router.get('/index', function(req, res){
    res.setHeader('Content-Type', 'text/html');
    if (!req.cookies.login) {
        res.redirect('/login');
    }else{
        res.sendfile("./views/index.html");
    }
});

/*
    @account  账户
    @password 密码
    @recommend 推荐码
*/
router.post('/register', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
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
    res.setHeader('Content-Type', 'application/json');
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

        res.cookie('login', account, { maxAge: 36000000 });

        if(data){response.data = data}
        res.send(response);
    })
})

//重置密码
router.post('/forget',function(req,res){
    res.setHeader('Content-Type', 'application/json');
    let account = req.body.account;
    let password = req.body.password;
    let recommond = req.body.recommond;

    let response = {code:errorcode["SUCCESS"]};
    if(!account || !password || !recommond){
        response.code = errorcode["INVALID_PARAMATER"]
        res.send(response)
        return;
    }
    password = common.hmacSH1(password);
    
    accountcheck.ResetPassword(account,password,recommond,function(err,data){
        if(err){ console.log(err); res.send({code:err}); return;}
        if(data){response.data = data}
        res.send(response);
    })
})

router.use('/operator', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    let body = req.body;
    let token = body.token;
    accountcheck.GetRegInfoByToken(token,function(err,data){
        if(err){ console.log(err); res.send({code:err}); res.end(); return;}
        req.body["_info_"] = data;
        next();
    })
});

router.post('/operator/send_gold',function(req,res){
    let info = req.body["_info_"]
    let send_num = Number(req.body.send_num)
    let user_id = Number(req.body.user_id)
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
    let user_id = Number(req.body.user_id)
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

//查询可用的推荐码 需要二级以上的权限
router.post('/operator/get_useable_recommand',function(req,res){
    let token = req.body.token
    let minLevel = 2
    let num = Number(req.body.num)
    let response = {code:errorcode["SUCCESS"]};
    if(!token ||!num){
        response.code = errorcode["INVALID_PARAMATER"]
        res.send(response)
        return;
    }
    accountcheck.GetRecommondInfo(token,minLevel,num,function(err,data){
        if(err){ console.log(err); res.send({code:err}); return;}
        if(data){response.data = data}
        res.send(response);
    })
})


router.post('/operator/get_info',function(req,res){
    let response = {code:errorcode["SUCCESS"]};
    let data ={}
    data.gold = req.body["_info_"].gold;
    data.level = req.body["_info_"].level;
    
    response.data = data
    res.send(response);
})


 
module.exports = router;
