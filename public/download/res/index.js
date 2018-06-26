var u 	= navigator.userAgent,
	 isAndroid   = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1,//android终端
	 isiOS       = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),//ios终端
	 ua          = window.navigator.userAgent.toLowerCase(),
	 isWeixin    = ua.match(/MicroMessenger/i) == 'micromessenger',//微信
	 briefMsg    = '',
	 gameName    = ''
	 android_download_url = '',//安卓下载地址
	 ios_download_url     = '',
	 
	 uri = window.location.host;
var flagShow =true;
$(function(){
    //下载按钮显示文字
	if(isiOS){
		$('#downloadBtn').html('安全下载');
	}else{
		$('#downloadBtn').html('安全下载');
	}
	//加载本地数据
	$.ajax({
		  type    : "get",
		  url     : "./res/config.json",
		  success : function(json){
			  console.log(json);
					fillContent(json);
		  },
		  error:function(XMLHttpRequest, textStatus, errorThrown){
		    	//alert(XMLHttpRequest); errorThrown
		  }
	});

	//下载按钮点击
	  $('#downloadBtn').click(function () {
	    if (isAndroid) {
	      if (!isWeixin) {
	        window.location.href = android_download_url;
	      }else{
	      	$('.top-download').show();
	      }
	    } else if (isiOS) {
	    	if(flagShow||uri.indexOf("uat.m.daba78.com") > -1){
	    		$('.tips').show();
	    		setTimeout(function(){
	    			$('.tips').hide();
	    		},3000)
	    	}else{
	    		window.location.href = ios_download_url;
	    	}
	    } else {
	      //alert('亲，请使用手机打开此网站！');
	      window.location.href = android_download_url;
	    	
	    }
	  });
	
});

//解析数据 和 给页面赋值
function fillContent(json){
	  var obj=json;
	  var projectName = obj.projectName;
	  var gameName = obj.gameName;
	  var description = obj.description;
	  var icon = obj.icon;
	  document.title = obj.title;
	  if(obj.icon){
		$('#wx_pic').html("<img src='"+obj.icon+"'/>");
	  }
	
	  $('.icp_number').html(obj.icp_number);//备案号
	  android_download_url=obj.android_download_url;
	  ios_download_url=obj.ios_download_url;
 
		
	 $('.logo').attr('src',icon); //头部logo图片形如：g_projectName
	  
	  
	  $('.logo_txt').html(gameName);//logo下游戏名
	  
	  $('.briefMsg').text(description);//麻将描述
	  
	  $('.beian').html(obj.icp_number);
	  
	  //动态加载轮播图
	  $('#lunbotu').show();
	  $('.xxmjm').hide();
	  $('.swipe-wrap div').each(function(index,ele){
			$(this).children('img').attr('src','res/'+projectName+'_'+index+'.jpg');
	  });
	  slider();
}

checkweixin();
//Check use WeiXin is or not.
function checkweixin() {
	 
  if (isWeixin) {
   $('.beian').css('bottom','0.5rem');
   $('.safeTip').css('bottom','0.4rem');
    if (isAndroid) {   	
	        $('.top-download').show();
	        $('.game-enter').css({'background': '#393a3f'});
	        //微信中添加遮罩层
	        $('#isphone').html("在浏览器中打开");
		    $('#pics').addClass("androidpic");
		    $('#imgss').addClass("andshareClass");
		    $('.andshareClass').attr("src","../img/androidpic.png");
		    $('.game-content').css({'top': '12px'});
    } /*else if (isiOS) {	
    	    $('.top-download').show();
		    $('.game-enter').css({'background': '#1b1a1f'});
	        //微信中添加遮罩层
			$('#isphone').html("在safari中打开");
			$('#pics').addClass("iospic");
			$('#imgss').addClass("shareClass");
			$('.shareClass').attr("src","../img/iospic.png");  
    }*/
    
	
  } else {
    $('.top-download').hide();//测试
    $('.game-content').css({'top': '0'});
  }
}

function slider(){
	//轮播图
    // pure JS
    var elem = document.getElementById('lunbotu');
    window.mySwipe = Swipe(elem, {
        // startSlide: 4,
         auto: 3500,        //每隔3000ms，自动轮播一次
        // continuous: true,
        // disableScroll: true,
        // stopPropagation: true,

//        回调函数表示没做完一个轮播，就执行下面的内容
         callback: function(index, element) {
//             console.log(index);           //在控制台输出index的值

//             让自己的li添加cur类，其他的兄弟li移除cur类，也就是一种排他
             $(".yuandian li").eq(index).addClass("cur").siblings().removeClass("cur");

         }
        // transitionEnd: function(index, element) {}
    });

//    点击小圆点，图片会有一个slide的效果
    $('.yuandian li').click(function(){
        mySwipe.slide($(this).index());
    });
	
    // with jQuery
    // window.mySwipe = $('#mySwipe').Swipe().data('Swipe');
}
function topHidden(){
  $('.top-download').hide();
}