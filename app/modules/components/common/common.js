// 页面初始化

// 微信sdk
var wx = require('weixin-js-sdk');

var common = function(page){
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
};
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

//判断是否登录，如果参数toLogin==true，未登录则跳往登录页
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
    var url = '/Api/Oauth/login?type=weixin&login_http_referer='+nowUrl;
    // var url = '/User/Login/mobile?appid='+appid+'&redirect_uri='+nowUrl+'&type=mobile&response_type=code';
    location.href = url;
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



module.exports = common;
