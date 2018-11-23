// 页面初始化

// 微信sdk
var wx = require('weixin-js-sdk');

function common(page){
  this.page = page;
  // 控制.hs-page高度
  this.countHeight();
  // 安卓兼容
  $('.actions-modal-group').on('click', function(){
    $('.modal-overlay').remove();
    $('.actions-modal').remove();
  })
  var contentHeight = $('.content').height();
  $('.content').on('scroll',function(){
    Lazyload();
  });
  Lazyload();
  function Lazyload() {
    $('[data-layzr]').each(function(){
      var status = $(this).attr('data-layzrstatus');
      if($(this).offset().top < contentHeight && !status){
        $(this).css('background-image', 'url('+ $(this).attr('data-layzr') +')');
        $(this).attr('data-layzrstatus', '1');
      }
    })
  }
  this.lazyLoad = Lazyload;

  //上传图片的base url
  this.ImgBaseUrl = 'https://img8.ontheroadstore.com';
  addCss();
};
//没有图片的默认url
common.prototype.lostImage = 'https://img8.ontheroadstore.com/iosupload/20180808/b0pMT2tsVk8vMmtzek1aSUtlYVlxQT09.jpg';

common.prototype.loadimg = function(){
  var contentHeight = $('.content').height();
  $('[data-layzr]').each(function(){
    var status = $(this).attr('data-layzrstatus');
    if($(this).offset().top < contentHeight && !status){
      $(this).css('background-image', 'url('+ $(this).attr('data-layzr') +')');
      $(this).attr('data-layzrstatus', '1');
    }
  })
}
common.prototype.countHeight = function(){
  if($(this.page).find('.hs-page').length){
    if($(this.page).find('header').length){
      $(this.page).find('.hs-main').css('top',lib.flexible.px2rem($(this.page).find('header').height())+'rem');
    } else {
      $(this.page).find('.hs-main').css('top','0');
    }
    $(this.page).find('.hs-main').css('bottom','0');
    // if($('footer').length){
    //   $(this.page).find('.hs-main').css('bottom',lib.flexible.px2rem($('footer').height())+'rem');
    // } else {
    //   $(this.page).find('.hs-main').css('bottom','0');
    // }
  }
}
// 检查是否关注公众号
common.prototype.checkfollow = function(){
  // 默认隐藏
  var _this = this;
  $.ajax({
    url: '/index.php?g=user&m=HsWeixin&a=userinfo&type=1',
    type: 'GET',
    async: true
  }).done(function (res) {
    if(res.data == 0) {
      $('.open_hs').hide();
      $('.open_app').hide();
      $('.open_hs').show();
      if($('.show-list').length == 1){
        $('.show-list').find('.return_top').css('bottom', '0.946rem');
      }
      $('.open_hs_close').click(function(){
        $('.open_hs').hide();
        _this.countHeight();
        close();
      })
    }else if(res.data == 1){
      $('.open_app').hide();
      $('.open_hs').hide();
      $('.open_app').show();
      if($('.show-list').length == 1){
        $('.show-list').find('.return_top').css('bottom', '0.946rem');
      }
      $('.open_app_close').click(function(){
        $('.open_app').hide();
        _this.countHeight();
        close();
      })
    }
    _this.countHeight();
  });
  // 关闭提示窗
  function close() {
    if($('.show-list').length == 1){
      $('.return_top').css('bottom', '2.226rem');
    }
    $.ajax({
      url: '/index.php?g=user&m=HsWeixin&a=userinfo&type=2',
      type: 'GET',
      async: true
    }).done(function (res) {
      console.log(res);
    });
  }
}
// 微信jssdk分享
common.prototype.wx_share = function(options){
  var _this = this;
  $.ajax({
    url: '/index.php?g=restful&m=HsJsapi&a=jssign',
    type: 'POST',
    data: {
      url: encodeURIComponent(options.link.split('#')[0])
    }
  }).done(function(data){

    // 判断是否分享
    if(options) {

      options.img = fixUrlProtocol(options.img);//补全分享图片url协议

      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'showAllNonBaseMenuItem',
        ]
      });
      wx.ready(function(){
      // 分享
      wx.onMenuShareTimeline({
        title: $.trim(options.title),
        link: options.link,
        imgUrl: options.img,
        success: function(){
          // 用户确认分享后执行的回调函数
          // 腾讯统计
          MtaH5.clickStat('wx_onMenuShareTimeline',{'title': options.title});
        }
      });
      wx.onMenuShareAppMessage({
        title: $.trim(options.title),
        desc: $.trim(options.desc),
        link: options.link,
        imgUrl: options.img,
        success:function(){
          // 用户确认分享后执行的回调函数
          // 腾讯统计
          MtaH5.clickStat('wx_onMenuShareAppMessage',{'title': options.title});
        }
      });
    });
    } else {
      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
        'checkJsApi',
        'scanQRCode',
        'openAddress'
        ]
      });
      wx.ready(function(){
        wx.hideOptionMenu();
      });
    }
  });

}
common.prototype.system_query = function() {
  var u = navigator.userAgent, app = navigator.appVersion;
  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
  var isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  if(isAndroid){
    return 'android';
  }
  if(isIos){
    return 'ios';
  }
  return null;
}

//获取url中的参数
common.prototype.getUrlParam = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
};

common.prototype.setCookie = function (name,value,days) {
    var Days = parseFloat(days)>0 ? parseFloat(days) : 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + ';path=/;';
};
common.prototype.getCookie = function (name) {
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
};
common.prototype.delCookie = function (name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
};

common.prototype.getApiBaseUrl = function(){
    var HostName = location.hostname;
    var ApiBaseUrl = 'https://apitest.ontheroadstore.com';

    if (HostName === "hs.ontheroadstore.com") {
        ApiBaseUrl = 'https://api.ontheroadstore.com';
    }
    return ApiBaseUrl;
};

//判断是否登录，如果参数toLogin==true，未登录则跳往登录页 注：需要在html中添加隐藏的input.current_user_id
common.prototype.ifLogin = function(toLogin){
    var $current_user_id = $('.current_user_id');
    var uid='';
    if($current_user_id.length>0){
        uid = $current_user_id.attr('uid');
        if(typeof uid === 'string' && uid.length>0){
            //已登录
            return uid;
        }
    }
    if(toLogin){
        this.toLogin();
    }
    return false;
};

//去往登录页
common.prototype.toLogin = function(){
    var appid = 'null';
    var nowUrl = encodeURI(location.href);
    // var url = '/Api/Oauth/login?type=weixin&login_http_referer='+nowUrl;
    // var url = '/User/Login/mobile?appid='+appid+'&redirect_uri='+nowUrl+'&type=mobile&response_type=code';
    // location.href = url;

    var postForm = document.createElement("form");//表单对象
    postForm.method="post" ;
    postForm.action = '/Api/Oauth/login' ;

    var typeInput = document.createElement("input") ; //type input
    typeInput.setAttribute("name", "type") ;
    typeInput.setAttribute("value", "weixin");
    postForm.appendChild(typeInput) ;
    var refererInput = document.createElement("input");// referer input
    refererInput.setAttribute("name","login_http_referer");
    refererInput.setAttribute("value",nowUrl);
    postForm.appendChild(refererInput);

    document.body.appendChild(postForm) ;
    postForm.submit() ;
    document.body.removeChild(postForm) ;

    return false;
};
//优惠券的格式化时间，显示为2001.11.11
common.prototype.couponFmtTime = function (time){

    function fixNum(v){
        return v<10 ? '0'+v : v;
    }

    time = String(time).length === 10 ? time*1000 : time;

    var t = new Date(time);
    var y = fixNum(t.getFullYear());
    var m = fixNum(t.getMonth()+1);
    var d = fixNum(t.getDate());

    return y + '.' + m + '.' + d;
};
//获取 几天 后的时间戳（默认10位）天、时、分、秒、是否13位
common.prototype.getTimestamp = function (day, hour, min, sec, full){
    day = isNaN(parseInt(day)) ? 0 : parseInt(day);
    hour = isNaN(parseInt(hour)) ? 0 : parseInt(hour);
    min = isNaN(parseInt(min)) ? 0 : parseInt(min);
    sec = isNaN(parseInt(sec)) ? 0 : parseInt(sec);

    var delay = ( day * 86400 + hour * 3600 + min * 60 + sec ) * 1000;//毫秒
    var now = (new Date()).getTime();   //当前13位时间戳
    var stp = +now + delay;
    if(!full){
        stp = parseInt(stp / 1000) ;
    }
    return stp;
};


//补全评论上传图片的imgUrl(因为不确定接口返回的imgurl是否是完整路径)
common.prototype.fixImgUrl = function (url,ImgBaseUrl) {

    ImgBaseUrl = ImgBaseUrl || this.ImgBaseUrl || 'https://img8.ontheroadstore.com';

    if(typeof url === 'string' && url.length>0){

        var arr = ['http://','https://','//'];

        for(var i=0;i<arr.length;i++){
            if(url.indexOf(arr[i])===0){
                return url;
            }
        }

        if(url.indexOf('/')===0){
            return ImgBaseUrl + url;
        }else{
            return ImgBaseUrl + '/' + url;
        }

    }

};

//判断是否是安卓
common.prototype.isAndroid = function (){
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    // var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    return isAndroid;
};

//添加css:由于less的bug，无法编译某些css，使用js添加到页面中
common.prototype.addCss = addCss();

function addCss(){
    if($('style.addcss').length>0){
        return;
    }
    var css = '';
    css+= '<style type="text/css" class="addcss">'
    css+= '.ellipsis_2{overflow : hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 2;}'
    css+= '.ellipsis_3{overflow : hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 3;}'
    css+= '.ellipsis_4{overflow : hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 4;}'
    css+= '.ellipsis_5{overflow : hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 5;}'
    css+= '</style>'
    $('body').append(css);
};


//时间戳格式化 调用方法  new Date(1541753878000).format('yyyy-MM-dd hh:mm:ss')
Date.prototype.format = function(format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};

//补全url协议同当前网页协议：修复分享url没有http或https时分享缩略图不显示的问题
function fixUrlProtocol(url){
    if(url && url.indexOf('//')===0){
        return location.protocol + url;
    }else{
        return url;
    }
}



module.exports = common;
