var mysql = require('mysql');
var util = require('util');
var mysql_pool = mysql.createPool({
    host:     '127.0.0.1',
    user:     "root",
    port:     3306,
    database: "lsj_game"
});

// 将table转化成插入sql语句
let convertInsertSql = function(tb_name,data) {
    let query = util.format("insert into `%s` ",tb_name);
    let fileds = [];
    let values = [];
    let updates = [];
    for( filed in data){
        let value = data[filed];
        fileds.push(filed);
        let temp_value = value;
        if (typeof(value) == 'string'){
            if(value != 'now()' && value != "NOW()"){
                //对用户数据进行转义 避免数据库注入
                value = mysql.escape(value);
                temp_value = util.format("%s",value);
                updates.push(util.format('`%s`=VALUES(`%s`)',filed,filed));
            }
        }
        values.push(temp_value);
    }
    console.log("fYD====",updates.join(','));
    query += "(`" + fileds.join("`,`") + "`)" + " values(" + values.join(",") + ")" + " ON DUPLICATE KEY UPDATE " + updates.join(',');

    return query;
}

let convertSelectSql = function(tb_name,filter) {
    let query 
    if(filter){
        query = "select * from " + tb_name + ' where ' + filter + ";";
    }
    else{
        query = "select * from " + tb_name + ";";
    }

    return query;
}

exports.Select = function(tbname,filter, call_back) {
    var sql_query = convertSelectSql(tbname,filter);
    mysql_pool.query(sql_query, function(err, rows, fileds) {
        console.log("sql=>",sql_query);
        if(err) console.log(err);
        call_back(err, rows, fileds);
    });
}

exports.Insert = function (tb_name,data,call_back) {
    var sql_query = convertInsertSql(tb_name,data);
    mysql_pool.query(sql_query, function(err, rows, fileds) {
        console.log("sql=>",sql_query);
        if(err) console.log(err);
        call_back(err, rows, fileds);
    });
}

exports.Escape = function(content) {
    return mysql.escape(content);
}










