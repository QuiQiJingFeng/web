var mysql = require('mysql');

var mysql_pool = mysql.createPool({
    host:     '127.0.0.1',
    user:     "root",
    // password: "",
    port:     3306,
    database: "gmtool"
});

mysql_pool.query("create table if not exists account_register (name varchar(30), password varchar(200), group_id int unsigned)", function(err, rows, fields) {
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















