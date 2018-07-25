let errorcode = {}

//成功
errorcode["SUCCESS"] = 0; 

//MYSQL 请求出错
errorcode["SQL_ERROR"] = 10001;             
//推荐码错误
errorcode["INVALID_RECOMMAND"] = 10002;
//账号已经注册
errorcode["ALREADY_REGISTER"] = 10003;
//参数错误
errorcode["INVALID_PARAMATER"] = 10004;
//账户或者密码错误
errorcode["INVALID_ACCOUNT_OR_PASSWORD"] = 10005;
//登录TOKEN错误
errorcode["INVALID_TOKEN"] = 10006;
//金币不足
errorcode["GOLD_NOT_ENOUGH"] = 10007;
//user_id 不存在
errorcode["USER_ID_NOT_EXIST"] = 10008;
//账户或者推荐码错误
errorcode["INVALID_RECOMMAND_OR_ACCOUNT"] = 10009;
//权限不足
errorcode["LOW_LEVEL"] = 10010;

module.exports = errorcode;