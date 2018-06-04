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
            }
        }
        updates.push(util.format('`%s`=VALUES(`%s`)',filed,filed));
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
    
    let time = common.getPreDayDateTime()
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

//查询某个玩家 在某个时间点之后的所有房间信息记录
exports.SelectReplaysByUserIdAndTime = function(user_id,pre_date,last_date,limit,game_type,call_back){
    let sql = ""
    let query = ""
    if(game_type){
        sql = "select max(replay_id) as replay_id,max(room_id) as room_id,max(players) as players,max(game_type) as game_type,max(time) as time from replay_ids where players like \"%user_id\\\":%d%\" and time >= \"%s\" and time < \"%s\" and game_type = %d group by room_id order by time desc limit %d;";
        query = util.format(sql,user_id,pre_date,last_date,game_type,limit);
    }else{
       sql = "select max(replay_id) as replay_id,max(room_id) as room_id,max(players) as players,max(game_type) as game_type,max(time) as time from replay_ids where players like \"%user_id\\\":%d%\" and time >= \"%s\" and time < \"%s\" group by room_id order by time desc limit %d;"; 
       query = util.format(sql,user_id,pre_date,last_date,limit);
    }
    mysql_pool.query(query, function(err, rows, fileds) {
        let error_code
        if(err) {
            console.log(err);
            error_code = constant.ERROR_CODE["90001"];
        };
        call_back(err, rows, error_code);
    });
}

//根据房间号查询战局记录
exports.SelectReplaysByRoomId = function(room_id,call_back) {
    let sql = "select * from replay_ids where room_id = %d"
    let query = util.format(sql,room_id)
    mysql_pool.query(query, function(err, rows, fileds) {
        let error_code
        if(err) {
            console.log(err);
            error_code = constant.ERROR_CODE["90001"];
        };
        call_back(err, rows, error_code);
    });
}


// 查询当前没有使用的激活码的数量
exports.SelectCountReduceActiveCode = function(user_id,call_back){
    let query = "select count(*) AS count from active_code_list where user_id = %d and active_id is null"
    query = util.format(query,user_id)
    mysql_pool.query(query, function(err, rows, fileds) {
        let error_code
        if(err) {
            console.log(err);
            error_code = constant.ERROR_CODE["90001"];
        };
        call_back(err, rows, error_code);
    });
}

// 查询当前所有没有使用的激活码
exports.SelectAllReduceActiveCode = function(user_id,call_back){
    let query = "select * from active_code_list where user_id = %d and active_id is null"
    query = util.format(query,user_id)
    mysql_pool.query(query, function(err, rows, fileds) {
        let error_code
        if(err) {
            console.log(err);
            error_code = constant.ERROR_CODE["90001"];
        };
        call_back(err, rows, error_code);
    });
}

// 玩家游戏中 激活 序列码
exports.ActiveActiveCode = function(active_id,active_code,call_back){
    let query = "update active_code_list set active_id = %d,active_time=NOW() where active_code = '%s' and active_id is null";
    query = util.format(query,active_id,active_code);
    mysql_pool.query(query, function(err, rows, fileds) {
            let error_code
            if(err) {
                console.log(err);
                error_code = 11
            };
            call_back(rows.affectedRows == 1)
        });
}


// 查找玩家(user_id)的 level 级代理的数量
exports.SearchProxyByLevel = function(user_id,level){
    var util = require('util');
    let prefix = "SELECT count(*) as count FROM user_info where invite_code REGEXP \"%d%s\"";
    let levelStr = "";
    for (let i = 1; i<=level; i++){
        levelStr += "-[0-9]*";
    }
    levelStr += "$";
    let query = util.format(prefix,user_id,levelStr);
    mysql_pool.query(query, function(err, rows, fileds) {
        let error_code
        if(err) {
            console.log(err);
            error_code = 11
        };
        call_back(rows)
    });
}
// 查询玩家(user_id) 的某级的全部代理
exports.SearchProxyByLevel = function(user_id,level){
    var util = require('util');
    let prefix = "SELECT count(*) as count FROM user_info where invite_code REGEXP \"%d%s\"";
    let levelStr = "";
    for (let i = 1; i<=level; i++){
        levelStr += "-[0-9]*";
    }
    levelStr += "$";
    let query = util.format(prefix,user_id,levelStr);
    mysql_pool.query(query, function(err, rows, fileds) {
        let error_code
        if(err) {
            console.log(err);
            error_code = 11
        };
        call_back(rows.affectedRows == 1)
    });
}