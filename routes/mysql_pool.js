var mysql = require('mysql');

var mysql_pool = mysql.createPool({
    host:     '127.0.0.1',
    user:     "root",
    // password: "",
    port:     3306,
    database: "gmtool"
});

mysql_pool.query("create table if not exists account_register (name varchar(200), password varchar(200), group_id int unsigned)", function(err, rows, fields) {
    if(err) throw err;
});

let orders_success = "create table if not exists orders_success \
                    (\
                        trade_no varchar(32),\
                        platform_order varchar(32),\
                        user_id varchar(10),\
                        account_platfrom varchar(16),\
                        account varchar(64),\
                        login_ip varchar(64),\
                        product_id int unsigned,\
                        total_fee float(7, 2),\
                        server_id int unsigned,\
                        device_id varchar(64),\
                        create_time datetime,\
                        primary key(trade_no)\
                    )";

mysql_pool.query(orders_success, 
                function(err, rows, fields) {
                    if(err) throw err;
                }
);

let orders_fail = "create table if not exists orders_fail \
                    (\
                      user_id varchar(10),\
                      trade_no varchar(32),\
                      platform_order varchar(32),\
                      errcode int,\
                      product_id int unsigned,\
                      total_fee float(7, 2),\
                      server_id int unsigned,\
                      device_id varchar(64),\
                      detail text,\
                      create_time datetime\
                    )";

mysql_pool.query(orders_fail, function(err, rows, fields) {
    if(err) throw err;
});
/*
    检查用户是否存在
    group_id = 0 表示超级管理员用户
    group_id = 1 表示管理员用户
    group_id = 2 表示普通用户
*/
exports.GetAccount = function GetAccount(name, func) {
    var sql_query = 'select * from account_register where name = \'' + name + '\''

    mysql_pool.query(sql_query, function(err, rows, fields) {
        if(err) console.log(err);
        func(rows)
    });
}
/*
    注册用户  group_id = 2
*/
exports.RegisterAccount = function RegisterAccount(name, password,func) {
    let group_id = 2;
    var sql_query = 'insert into account_register (name, password, group_id) value (\'' + name + '\',\'' + password + '\',' + group_id + ')';

    mysql_pool.query(sql_query, function(err, rows, fields) {
        if(err) {
            console.log(err);
            func(false);
        }else {
            func(true);
        }

    });
}

exports.GetOrderState = function(trade_no, func)
{
    var sql_query = 'select * from orders_success where trade_no = \'' + trade_no + '\'';
    mysql_pool.query(sql_query, func);
}

exports.OrderSuccess = function(trade_no, platform_order,user_id,account_platfrom,account,login_ip,product_id,total_fee,server_id,device_id)
{   
    let querystr = "insert into orders_success \
                    (trade_no, platform_order, user_id, \
                    account_platfrom, account, login_ip, product_id, \
                    total_fee, server_id, device_id, create_time) \
                    value('%s', '%s', '%s', '%s', '%s', '%s', %d, %f, %d, '%s', now())";
    querystr = util.format(querystr,trade_no, platform_order,user_id,account_platfrom,account,login_ip,product_id,total_fee,server_id,device_id);

    mysql_pool.query(sql_query, function(err, rows, fields) {
        if(err) console.error(err);
    });
}

exports.OrderFail = function(user_id, trade_no, platform_order, errcode,product_id, total_fee,server_id, device_id, detail)
{
    let querystr = "insert into orders_fail \
                    (user_id, trade_no, platform_order, errcode, \
                    product_id, total_fee, \
                    server_id, device_id, detail,create_time) \
                    value('%s', '%s', '%s', %d, %d, %f, %d, '%s', '%s', now())";
    var sql_query = util.format(querystr,user_id, trade_no, platform_order, errcode,product_id, total_fee,server_id, device_id, detail);
                                
    mysql_pool.query(sql_query, function(err, rows, fields) {
        if(err) console.error(err);
    });
}











