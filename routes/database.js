var mysql = require('mysql');
let async = require('async');
var db = mysql.createPool({
    host:     '127.0.0.1',
    user:     "root",
    port:     3306,
    database: "lsj_game"
});

exports.IsExistRecommond = function(recommond,callBack){
    recommond = mysql.escape(recommond)
    let query = `SELECT * FROM code_list WHERE code = ${recommond} and useable = 0;`
    db.query(query, function(err, rows, fileds) {
        if(err) console.log(err);
        callBack(err, rows, fileds);
    });
}

exports.IsRegisterAccount = function(account,callBack){
    account = mysql.escape(account)
    let query = `SELECT * FROM console_register WHERE account = ${account};`
    db.query(query, function(err, rows, fileds) {
        if(err) console.log(err);
        callBack(err, rows, fileds);
    });
}

exports.RegisterAccount = function(account,password,recommond,callBack){
    account = mysql.escape(account)
    password = mysql.escape(password)
    recommond = mysql.escape(recommond)
    let query = `INSERT INTO console_register (account,password,recommend,time) VALUES(${account},${password},${recommond},NOW())`;
    db.query(query, function(err, rows, fileds) {
        if(err) console.log(err);
        callBack(err, rows, fileds);
    });
}

exports.SelectAccountAndPassword = function(account,password,callBack){
    account = mysql.escape(account)
    password = mysql.escape(password)
    let query = `SELECT * FROM console_register WHERE account = ${account} and password = ${password}`;
    db.query(query, function(err, rows, fileds) {
        if(err) console.log(err);
        callBack(err, rows, fileds);
    });
}

exports.InsertLogin = function(account,callBack){
    account = mysql.escape(account)
    let query = `INSERT INTO console_login (account,time) VALUES(${account},NOW())`
    console.log("FYD -- ",query)
    db.query(query, function(err, rows, fileds) {
        if(err) console.log(err);
        callBack(err, rows, fileds);
    });
}

exports.UpdateToken = function(account,token,callBack){
    account = mysql.escape(account)
    token = mysql.escape(token)
    let query = `UPDATE console_register SET token = ${token} WHERE account = ${account}`;
    console.log("FGFII -<",query)
    db.query(query, function(err, rows, fileds) {
        if(err) console.log(err);
        callBack(err, rows, fileds);
    });
}

exports.SelectInfoByToken = function(token,callBack){
    token = mysql.escape(token)
    let query = `SELECT * FROM console_register WHERE token = ${token}`;
    db.query(query, function(err, rows, fileds) {
        if(err) console.log(err);
        callBack(err, rows, fileds);
    });
}

exports.SelectUserInfoById = function(user_id,callBack){
    let query = `SELECT * FROM user_info WHERE user_id = ${user_id}`;
    db.query(query, function(err, rows, fileds) {
        if(err) console.log(err);
        callBack(err, rows, fileds);
    });
}


exports.ExecuteTransaction = function(squeue,callBack){
    console.log("FYYYYY squeue ",squeue.length)
    db.getConnection(function(err, connection) {
        if(err) {
            console.error('mysql 链接失败');
            return callBack(err, null);
        }
        // 开始事务
        connection.beginTransaction(function(err) {
            if(err) {
                throw err;
            }

            let index = 0
            let squeueExecs = []
            for(index = 0;index < squeue.length; index++){
                let idx = index
                let queryFunc = function(callBack) {
                    let query = squeue[idx]
                    connection.query(query, function(err, rows, fileds) {
                        if(err) console.log(err);
                        callBack(err, rows, fileds);
                    });
                }
                squeueExecs.push(queryFunc)
            }
            async.parallel(squeueExecs, function(err, result) {
                if(err) {
                    connection.rollback(function() {
                        throw err;
                    });
                    callBack(err);
                    return ;
                }
                // 提交事务
                connection.commit(function(err) {
                    if (err) { 
                        connection.rollback(function() {
                            throw err;
                        });
                    }
                    callBack(err);
                });
            });
        });
    })
}

exports.SendGoldToUser = function(account,user_id,send_num,pre_gold,callBack){
    account = mysql.escape(account)

    let query1 = `UPDATE console_register SET gold = gold - ${send_num} WHERE account = ${account};`
    let query2 = `UPDATE user_info SET gold_num = gold_num + ${send_num} WHERE user_id = ${user_id};`
    let query3 = `INSERT INTO resource VALUES(${user_id},${pre_gold},${send_num},${pre_gold-send_num},NOW());`
    exports.ExecuteTransaction([query1,query2,query3],callBack)
}
 

 