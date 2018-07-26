/**
  项目JS主入口
  以依赖layui的layer和form模块为例
**/

let CONFIG = null;
let selectData = null

function GetConfig(element){
  $.ajax({
    type: 'GET',
    url: 'config.js',
    success: function(msg){
      let data = JSON.parse(msg)
      CONFIG = data;
      $("#dynamic_left_list").empty();
      $.each(data,function(index,item){
        let str = `<li class="layui-nav-item"  data-id=${index} ><a>${item.name}</a></li>`
        $('#dynamic_left_list').append(str);// 下拉菜单里添加元素
      })
      element.init()
    },
    error:function (status) {//请求失败后调用的函数
      alert('配置获取失败 status:',status);
    }
  });
}

function MakeInput(config){
  let content = `
    <div class="layui-form-item">
      <label class="layui-form-label">${config.key}</label>
      <div class="layui-input-block">
        <input type="${config.type}" name=${config.key} placeholder=${config.type == 'text'?"请输入字符串":"请输入数字"} value=${config.key == 'token' ? getCookieValue('token'):''} required  lay-verify="required" autocomplete="off" class="layui-input">
      </div>
    </div>
  `
  return content;
}

function MakeCommit(){
  let content = `
    <div class="layui-form-item">
      <div class="layui-input-block">
        <button class="layui-btn" lay-submit lay-filter="formDemo">立即提交</button>
        <button type="reset" class="layui-btn layui-btn-primary">重置</button>
      </div>
    </div>
  `
  return content
}

function SelectNavItem(id){
  $("#dynamic_ui").empty();
  selectData = CONFIG[id]
  let paramaters = CONFIG[id].paramaters;
  $.each(paramaters,function(index,config){
    let content = MakeInput(config)
    $("#dynamic_ui").append(content)
  })
  let content = MakeCommit()
  $("#dynamic_ui").append(content)

  layui.form.render();
}

function RegisterNavEvent(element){
  element.on('nav(left_nav)',function(data){
    var id = data.attr('data-id');
    SelectNavItem(id)
  })
}

function InitUserInfo(){
  console.log($("#gold").text());
  $("#gold").text(getCookieValue("gold"));
  $("#level").text(getCookieValue("level"));
}

layui.use('element', function(){
  var element = layui.element;
  InitUserInfo()
  //根据配置更新左侧列表
  GetConfig(element)
  //监听点击事件
  RegisterNavEvent(element)

  
});

layui.use('form', function(){
  var form = layui.form;
  //监听提交
  form.on('submit(formDemo)', function(data){
    $.ajax({
      type: 'POST',
      url: selectData.url,
      data: data.field,
      success: function(msg){
        layer.open({
          title: '执行结果'
          ,content: ERROR_CODE[msg.code]
        });
        if(msg.code != 0){
            return;
        }
        if(msg.data && msg.data.gold){
          $("#gold").text(msg.data.gold);
          setCookie("gold", msg.data.gold, 10)
        }


        $("#result").remove();
        let content = `
        <div id = "result" class="layui-form-item layui-form-text">
          <label class="layui-form-label">执行结果</label>
          <div class="layui-input-block">
            <textarea name="desc" placeholder="请输入内容" class="layui-textarea">${JSON.stringify(msg)}</textarea>
          </div>
        </div>
        `
        $("#dynamic_ui").append(content)
        layui.form.render();
      },
      error:function (status) {//请求失败后调用的函数
        layer.open({
          title: '配置获取失败'
          ,content: status
        });
      }
    });
  
    return false;
  });
});



