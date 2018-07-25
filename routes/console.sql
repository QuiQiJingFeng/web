CREATE DATABASE IF NOT EXISTS lsj_game default char set utf8;
use lsj_game;

-- 用户的注册信息表
CREATE TABLE console_register
(
    account         varchar(255),            -- 玩家的账户
    password        varchar(200),            -- 玩家的密码 MD5 (平台的登陆因为需要向平台去验证,所以这里不需要存储)
    recommend       varchar(20),             -- 推荐码
    level           int default 1,           -- 用户权限
    gold            double default 0,        -- 金币余额
    time            datetime,                -- 注册的时间
    token           varchar(255) default '',            -- 登录的token
    primary key(account)
);

-- 用户的登录信息表
CREATE TABLE console_login
(
    account         varchar(255),            -- 玩家的账户
    time            datetime
);
 
-- 金币转出记录
CREATE TABLE resource
(
     target_id        int(10),                 -- 指定的玩家ID
     pre_gold         double,                  -- 转出之前的金币数量
     num              double,                  -- 转出的数量
     last_gold        double,                  -- 转出之后的金币数量
     time             datetime                 -- 转出的时间
);

-- 当前可用的码列表
CREATE TABLE code_list
(
    code       varchar(20),      -- 激活码
    useable           int(1) default 0, -- 是否使用过
    primary key(code)
);