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
module.exports = common;
