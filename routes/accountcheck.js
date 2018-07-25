let async = require('async');
let database = require('./database');
let errorcode = require('./errorcode');
let assert = require('assert');
let common = require('./common');

//1、检查推荐码是否可用
let isInvilidRecommond = function(data,callBack){
    let recommond = data.recommond
    console.log("111111111")
    assert(recommond,"recommond == null")
    
    database.IsExistRecommond(recommond,function(err,rows,fileds){
        console.log("2222222222")
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        let info = rows[0];
        if(!info){
            console.log("333333333333")
            callBack(errorcode["INVALID_RECOMMAND"]); return;
        }
        console.log("444444444444")
        callBack(null,data);
    })
}

//2、检查账户是否注册
let isRegisterAccount = function(data,callBack){
    let account = data.account
    assert(account,"account == null")
    database.IsRegisterAccount(account,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        let info = rows[0];
        if(info){
            callBack(errorcode["ALREADY_REGISTER"]); return;
        }
        callBack(null,data);
    });
}

//3、注册账号
let registerAccount = function(data,callBack){
    let account = data.account;
    let password = data.password;
    let recommond = data.recommond;

    database.RegisterAccount(account,password,recommond,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        callBack(null,null);
    });
}
exports.RegisterByRecommond = function(account,password,recommond,callBack){
    let data = {}
    data.account = account;
    data.password = password;
    data.recommond = recommond;
    
    let process = async.compose(registerAccount,isRegisterAccount,isInvilidRecommond)
    process(data,callBack);
}



// 检查账户密码是否存在 level
let selectAccountAndPassword = function(data,callBack){
    let account = data.account;
    let password = data.password;
    database.SelectAccountAndPassword(account,password,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        let info = rows[0];
        if(!info){
            callBack(errorcode["INVALID_ACCOUNT_OR_PASSWORD"]); return;
        }
        data.level = info.level
        data.gold = info.gold
        callBack(null,data);
    });
}

let insertLoginInfo = function(data,callBack){
    let account = data.account;
    database.InsertLogin(account,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        let time = new Date().getTime();
        data.token = common.hmacSH1(account + time);
        callBack(null,data);
    })
}

let updateToken = function(data,callBack){
    let account = data.account;
    let token = data.token;
    database.UpdateToken(account,token,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        let info = {}
        info.token = data.token
        info.level = data.level
        info.gold = data.gold
        callBack(null,info);
    })
}

exports.LoginByAccoutAndPassword = function(account,password,callBack){
    let data = {}
    data.account = account;
    data.password = password;
    let process = async.compose(updateToken,insertLoginInfo,selectAccountAndPassword)
    process(data,callBack);
}

exports.GetRegInfoByToken = function(token,callBack){
    let data = {}
    data.token = token
    database.SelectInfoByToken(token,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        
        let info = rows[0]
        if(!info){
            callBack(errorcode["INVALID_TOKEN"]); return;
        }
        callBack(null,info);
    })
}



let checkUserIdExist = function(data,callBack){
    let user_id = data.user_id
    database.SelectUserInfoById(user_id,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        let info = rows[0]
        if(!info){
            callBack(errorcode["USER_ID_NOT_EXIST"]); return;
        }
        callBack(null,data);
    })
}

let updateGoldToUser = function(data,callBack){
    let account = data.account;
    let user_id = data.user_id;
    let send_num = data.send_num;
    let pre_gold = data.reduce_gold;

    database.SendGoldToUser(account,user_id,send_num,pre_gold,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        callBack(null,null);
    })
}

exports.SendGoldToUser = function(account,user_id,send_num,reduce_gold,callBack){
    let data = {}
    data.account = account;
    data.user_id = user_id;
    data.reduce_gold = reduce_gold;
    data.send_num = send_num;
    let process = async.compose(updateGoldToUser,checkUserIdExist)
    process(data,callBack);
}


exports.GetSpecialUserInfo = function(user_id,callBack){
    database.SelectUserInfoById(user_id,function(err, rows, fileds){
        if(err){ callBack(errorcode["SQL_ERROR"]); return;}
        let info = rows[0]
        if(!info){
            callBack(errorcode["USER_ID_NOT_EXIST"]); return;
        }
        let body = {}
        body.user_id = info.user_id
        body.user_name = info.user_name;
        body.user_pic = info.user_pic;
        body.gold_num = info.gold_num;
        body.sex = info.sex;

        callBack(null,body);
    })
}
 