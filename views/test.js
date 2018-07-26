let util = require('util');
let DynamicContent = {}

DynamicContent.Init = function(){
	let self = this;
	self.__html = {}
	self.__html["body"] = []
}

DynamicContent.PushHeader = function(){
	let self = this;
	self.__html["header"] = [`
        <meta charset="utf-8">
        <title>萌芽娱乐后台系统</title>
        <link href="layui/css/layui.css" rel="stylesheet" type="text/css" /> 
        <script src="js/jquery.min.js"></script>
        <script src="layui/layui.js"></script>
        <script>
            layui.config({
                base: 'js/' //你存放新模块的目录，注意，不是layui的模块目录
            }).use('index'); //加载入口
        </script>   
	`]
}

DynamicContent.MakeTitleList = function(gold,level){
	let self = this;
	let tList = `
	<ul class="layui-nav">
            <li class="layui-nav-item">
                <a><img src="images/gold.png" class="layui-nav-img">%d</a>
            </li>
            <li class="layui-nav-item">
                <a><img src="images/level.png" class="layui-nav-img">%d</a>
            </li>
            <li class="layui-nav-item">
                <a href=""><img src="http://t.cn/RCzsdCq" class="layui-nav-img">管理</a>
                <dl class="layui-nav-child">
                    <dd><a>绑定手机</a></dd>
                    <dd><a>退出登录</a></dd>
                </dl>
            </li>
        </ul>
	`
	tList = util.format(tList,gold,level)

	self.__html["body"].push(tList)
}

DynamicContent.MakeLeftList = function(){
	let self = this;
	let lList = `
	<ul class="layui-nav layui-nav-tree" style="float:left">
        <li class="layui-nav-item layui-nav-itemed">
            <a>功能列表</a>
        </li>
        <li class="layui-nav-item">
            <a>金币充值</a>
        </li>
        <li class="layui-nav-item">
            <a>金币赠送</a>
        </li>
        <li class="layui-nav-item">
            <a>查询用户信息</a>
        </li>
        <li class="layui-nav-item">
            <a>赠送记录</a>
        </li>
        <li class="layui-nav-item">
            <a>获取推荐码</a>
        </li>
    </ul>
	`
	self.__html["body"].push(lList)
}


module.exports = DynamicContent