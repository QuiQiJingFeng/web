var https = require('https');
var http = require('http');
let mysql_pool = require('./mysql_pool.js');

let BUNDLE_ID_LIST = ["com.fyd.game"];

let appstore = {};

var request_count = 0;
var all_options = 
[
    //正式订单校验地址
    {
        hostname: "buy.itunes.apple.com",
        path: "/verifyReceipt",
        method: 'POST',
        timeout: 15000,
        headers : {
            'Content-Type': 'application/json',
            charset: 'utf-8',
        }
    }
    ,
    //沙箱订单校验地址
    {
        host: "sandbox.itunes.apple.com",
        path: "/verifyReceipt",
        method: 'POST',
        timeout: 15000,
        headers : {
            'Content-Type': 'application/json',
            charset: 'utf-8',
        }
    }
]
let VerifyReciept = function(receipt, func) {
    var data_json = {
        'receipt-data': receipt
    };
    var post_data = JSON.stringify(data_json);

    if(request_count < 0) request_count = 0;

    var choose_option = request_count % 2;
    var MethodFunc = http.request;
    var options = all_options[choose_option];
    if(choose_option == 0) {
        MethodFunc = https.request;
    }

    var req = MethodFunc(options, function(res) {
        if(res.statusCode != 200) {
            request_count = request_count - 1;
            console.log("statusCode:", res.statusCode);
            func(false);
            return;
        }
        res.setEncoding('utf-8');

        var responseString = [];

        res.on('data', function(data) {
            responseString.push(data);
        });

        res.on('end', function() {
            request_count = request_count - 1;
            func(true, responseString);
        });

        res.on('error', function(err) {
            request_count = request_count - 1;
            console.error("res error:" + err);
            func(false);
        });

    });
    req.write(post_data);
    req.end();

    request_count = request_count + 1;

    req.on('timeout', function(e) {
        console.log("timeout:" + e.message);
    });

    req.on('error', function(err) {
        request_count = request_count - 1;
        console.log("req error:" + err);
        func(false);
    });
}


//检查客户端传来的数据  跟 苹果后台返回的数据是否一致
let CheckDetail = function(info,platform_order,product_id) {
    if(info.product_id != product_id || info.transaction_id != platform_order) {
        return false;
    }
    return true;
}
//bundle_id用来校验苹果的收据是否为本游戏的收据
let CheckBundleId = function (receipt_info) {
    var check_result = false;
    for(var i = 0; i < BUNDLE_ID_LIST.length; ++i)
    {
        var bundle_id = BUNDLE_ID_LIST[i];
        if(receipt_info.receipt.bundle_id == bundle_id || receipt_info.receipt.bid == bundle_id)
        {
            check_result = true;
            break;
        }
    }
      
    return check_result;
}

appstore.Check = function(trade_no,body,res_json,res,req) {

    try {
        //平台订单号(apple的订单号)
        let platform_order = body.platform_order;
        let product_id = body.product_id;
        let receipt = body.receipt;
        let user_id = body.user_id;
        let account_platfrom = body.account_platfrom;
        let account = body.account;
        let login_ip = body.login_ip;
        let total_fee = body.total_fee;
        let server_id = body.server_id;
        let device_id = body.device_id;

        VerifyReciept(receipt,function(succ, receipt_ret){
            if(succ) {
                let receipt_info = JSON.parse(receipt_ret);
                //检查苹果的订单状态
                if(receipt_info.status != 0) {
                    res_json.errcode = -1;  
                }else if(!CheckBundleId(receipt_info)) {
                    res_json.errcode = -4;
                }else {
                    try {
                        let in_app = receipt_info.receipt.in_app;
                        let check = false;
                        res_json.errcode = -4;
                        if(in_app && in_app.length > 0) {
                            for(var i = 0; i < in_app.length; i++) {
                                if(CheckDetail(in_app[i], platform_order,product_id)) {
                                    check = true;
                                    break;
                                }
                            }
                        }
                        //如果in_app为空，有可能是由于StoreKit未初始化,所以需要加入重试队列
                        else if(in_app && in_app.length == 0) {
                            res_json.errcode = -5;
                        }
                        //如果in_app不存在,则可能是ios7.0之前的系统
                        else if(!in_app) {
                            check = CheckDetail(receipt_info.receipt, platform_order, product_id);
                        }
                        if(check) {
                            res_json.errcode = 0;
                        }
                    }catch(err) {
                        console.log(err);
                    }

                    //如果由于连接断开导致没有通知到游戏服发奖,则需要手动发奖
                    if(!req.client.destroyed){
                        res.write(JSON.stringify(res_json));
                    }

                    if(res_json.errcode == 0){
                        //记录成功的订单
                        mysql_pool.OrderSuccess(trade_no, platform_order,user_id,account_platfrom,account,login_ip,product_id,total_fee,server_id,device_id);
                    }else{
                        //记录失败的订单
                        mysql_pool.OrderFail(user_id, trade_no, platform_order, res_json.errcode,product_id, total_fee,server_id, device_id, receipt_ret);
                    }
                }
            }else {
                if(!req.client.destroyed) {
                    res.write(JSON.stringify(res_json));
                }
            }
        });
    }catch(err){
        console.error("VERIFY RECIEPT ERROR: platform_order = ",platform_order);
        console.error(err);
        if(!req.client.destroyed){
            res.write(JSON.stringify(res_json));
        }
    }
}



module.exports = appstore;