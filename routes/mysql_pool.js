var mysql = require('mysql');
var util = require('util');
var common = require("./common.js")
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
        let error_code
        if(err) {
            console.log(err);
            error_code = constant.ERROR_CODE["90001"];
        };
        call_back(err, rows, error_code);
    });
}

exports.Insert = function (tb_name,data,call_back) {
    var sql_query = convertInsertSql(tb_name,data);
    mysql_pool.query(sql_query, function(err, rows, fileds) {
        if(err) console.log(err);
        call_back(err, rows);
    });
}

exports.Escape = function(content) {
    return mysql.escape(content);
}

exports.SelectCreateOrJoinRoom = function(user_id,call_back) {
    let str = "select join_room.user_id,room_list.room_id,room_list.state,room_list.player_list,room_list.game_type,room_list.expire_time from join_room inner join room_list on join_room.room_id = room_list.room_id where time > '%s' and user_id = %s UNION select create_room.user_id,room_list.room_id,room_list.state,room_list.player_list,room_list.game_type,room_list.expire_time from create_room inner join room_list on create_room.room_id = room_list.room_id where time > '%s' and user_id = %s"
    
    let time = common.getNowDateTime()
    let query = util.format(str,time,user_id,time,user_id)
    mysql_pool.query(query,function(err, rows, fileds){
        let error_code
        if(err) {
            console.log(err);
            error_code = constant.ERROR_CODE["90001"];
        };
        call_back(err, rows, error_code);
    })
    
}

// 查找房间号所在的服务器
exports.SelectServerByRoomId = function(room_id,call_back) {
    let query = "select server_id,server_host,server_port from room_servers where server_id in (select server_id from room_list where room_id=%d);"
    query = util.format(query,room_id)
    mysql_pool.query(query, function(err, rows, fileds) {
        let error_code
        if(err) {
            console.log(err);
            error_code = constant.ERROR_CODE["90001"];
        };
        call_back(err, rows, error_code);
    });
}








